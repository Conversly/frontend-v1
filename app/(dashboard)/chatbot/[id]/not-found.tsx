import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-svh w-full place-items-center">
      <div className="flex flex-col gap-4 text-center">
        <div className="">
          <Image
            src="/icons/error.png"
            alt="error"
            width={110}
            height={110}
            className="mx-auto"
          />
          <h2 className="text-2xl font-semibold text-grey-50">Not Found</h2>
          <p className="text-grey-200">Could not find requested resource</p>
        </div>

        <Button asChild className="rounded-full">
          <Link href="/" className="">
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
