import { handleEnquiry } from '@/lib/enquiry/handle';

export const maxDuration = 15;

export async function POST(request: Request) {
  return handleEnquiry('quote', request);
}
