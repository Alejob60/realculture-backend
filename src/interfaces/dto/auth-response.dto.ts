export class AuthResponseDto {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  credits: number;
  picture?: string; // si planeas agregarlo luego
}
