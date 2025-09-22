import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import * as crypto from 'crypto';

@ApiTags('wompi')
@Controller('wompi')
export class WompiController {
  @Get('/checkout-data')
  @ApiOperation({ summary: 'Get checkout data for Wompi payment' })
  @ApiQuery({ name: 'plan', enum: ['pro', 'creator'], description: 'Plan to purchase' })
  @ApiResponse({ status: 200, description: 'Returns checkout data.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  getCheckoutData(@Query('plan') plan: string) {
    const priceMap = {
      pro: 11600000,
      creator: 23600000,
    };

    if (!plan || !(plan in priceMap)) {
      throw new BadRequestException(`Plan inválido: ${plan}`);
    }

    const amount = priceMap[plan as keyof typeof priceMap];
    const currency = 'COP';
    const reference = `realculture_${plan}_${Date.now()}`;

    const publicKey = process.env.WOMPI_PUBLIC_KEY!;
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY!;
    const redirectUrl = process.env.WOMPI_REDIRECT_URL!;

    const signature = crypto
      .createHash('sha256')
      .update(`${amount}${currency}${reference}${integrityKey}`)
      .digest('hex');

    console.log(`🔐 Generando firma para plan ${plan}`);
    return {
      publicKey,
      currency,
      amount,
      reference,
      redirectUrl,
      signature,
    };
  }
}