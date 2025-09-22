import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { PromptJsonService } from '../../infrastructure/services/prompt-json.service';
import { RequestWithUser } from 'src/types/request-with-user';

const PLAN_CREDITS = {
  'prompt-json': {
    FREE: 5,
    CREATOR: 10,
    PRO: 15,
  },
};

@ApiTags('prompt-json')
@Controller('prompt-json')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromptJsonController {
  private readonly logger = new Logger(PromptJsonController.name);

  constructor(
    private readonly promptJsonService: PromptJsonService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Generate JSON from prompt' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', example: 'Generate a JSON for a product catalog' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'JSON generated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async generateJson(@Body() body: { prompt: string }, @Req() req: RequestWithUser) {
    try {
      this.logger.log(`Received request to generate JSON with body: ${JSON.stringify(body)}`);
      
      // Extract userId from the properly typed user object
      const userId = req.user?.id;
      this.logger.log(`Extracted userId from request: ${userId}`);

      // Validate user object and userId
      if (!req.user) {
        this.logger.error('User object is undefined in request');
        throw new HttpException(
          'Usuario no identificado',
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      if (!userId) {
        this.logger.error('User ID is undefined in request');
        throw new HttpException(
          'ID de usuario no encontrado',
          HttpStatus.UNAUTHORIZED,
        );
      }

      this.logger.log(`Processing request for userId: ${userId}`);
      
      const user = await this.userService.findById(userId);
      if (!user) {
        this.logger.warn(`User not found for userId: ${userId}`);
        throw new NotFoundException('Usuario no encontrado');
      }

      const userPlan = user?.role || 'FREE';
      const serviceKey = 'prompt-json';
      const requiredCredits = PLAN_CREDITS[serviceKey]?.[userPlan] ?? null;

      if (requiredCredits === null) {
        this.logger.warn(`User plan ${userPlan} does not allow JSON generation`);
        throw new HttpException('Tu plan no permite generar JSON', HttpStatus.FORBIDDEN);
      }

      if (!user || user.credits < requiredCredits) {
        this.logger.warn(`Insufficient credits for userId: ${userId}, credits: ${user?.credits}, required: ${requiredCredits}`);
        throw new HttpException('Créditos insuficientes', HttpStatus.FORBIDDEN);
      }

      if (!body?.prompt || typeof body.prompt !== 'string' || body.prompt.trim() === '') {
        this.logger.warn(`Invalid prompt provided: ${JSON.stringify(body)}`);
        throw new HttpException('Prompt inválido o vacío', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Calling promptJsonService with prompt: ${body.prompt}`);
      const result = await this.promptJsonService.generatePromptJson(body.prompt);
      this.logger.log(`Successfully generated JSON, updating user credits for userId: ${userId}`);
      const updatedUser = await this.userService.decrementCredits(userId, requiredCredits);

      return {
        success: true,
        message: '✅ JSON generado correctamente',
        result,
        credits: updatedUser.credits,
      };
    } catch (error) {
      this.logger.error(`Error al generar JSON: ${error.message}`, error.stack);
      throw new HttpException(
        'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}