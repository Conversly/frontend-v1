"use client";

import Icons from "@/assets/icons";
import { GoogleAuth } from "@/components/auth";
import { LOCAL_STORAGE_KEY } from "@/utils/local-storage-key";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (
      pathname === "/" &&
      localStorage.getItem(LOCAL_STORAGE_KEY.IS_LOGGED_IN) === "true"
    ) {
      router.push("/radar");
    }
  }, []);

  useEffect(() => {
    const code = searchParams.get("invite_code");
    if (code) {
      setInviteCode(code);
    }
  }, [searchParams]);

  return (

    <>
      <div className="mx-auto flex min-h-svh flex-col gap-5 overflow-x-hidden p-4 text-white sm:w-full">
        <nav className="mx-auto flex w-full max-w-screen-4xl items-center justify-between transition-all duration-300 ease-out">
          <Link href="/">
            <svg
              viewBox="0 0 107 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10"
            >
              <path
                d="M18.1739 9.74908L25.4442 9.74902L10.4419 24.7513C10.3544 24.8388 10.2357 24.888 10.1119 24.888L7.13854 24.888C6.88081 24.888 6.67188 24.6791 6.67188 24.4213L6.67188 21.4479C6.67188 21.3242 6.72104 21.2055 6.80856 21.118L18.0261 9.90041L18.1739 9.74908Z"
                fill="#07DB76"
              />
              <path
                d="M23.1602 24.8867C23.4178 24.8866 23.627 24.6776 23.627 24.4199V21.4482C23.6269 21.3246 23.5777 21.2056 23.4902 21.1182L16.0566 13.6855L12.2725 9.90137L12.1299 9.75684L18.7725 3.11426L11.502 3.11523L11.3545 3.26562L4.87109 9.74902L4.85645 9.74805L4.86426 9.75586L0.136719 14.4834C0.0492337 14.5709 3.5895e-05 14.6898 0 14.8135V17.7871C6.11303e-05 18.0448 0.209102 18.2539 0.466797 18.2539H3.44043C3.56406 18.2538 3.68308 18.2046 3.77051 18.1172L8.49707 13.3896L19.8584 24.75C19.9459 24.8375 20.0647 24.8867 20.1885 24.8867H23.1602Z"
                fill="#4FFFAB"
              />
              <path
                d="M18.7607 3.11216L11.4922 3.11035L26.4945 18.1126C26.582 18.2002 26.7007 18.2493 26.8245 18.2493H29.7961C30.0538 18.2493 30.2628 18.0404 30.2628 17.7827L30.2628 14.811C30.2628 14.6873 30.2136 14.5686 30.1261 14.481L18.9085 3.26349L18.7607 3.11216Z"
                fill="#07DB76"
              />
              <path
                d="M44.5817 17.296V14.224H47.4857V17.584C47.4857 20.08 46.0457 22.312 42.7097 22.312C39.2537 22.312 37.8857 20.104 37.8857 17.56V7H40.9577V10.192H47.4857V12.4H40.9577V17.248C40.9577 18.736 41.4857 19.6 42.7577 19.6C44.0057 19.6 44.5817 18.76 44.5817 17.296ZM52.3607 22H49.2407V10.192H52.1687V11.608C53.2007 10.024 54.4007 9.88 55.6727 9.88H56.0807V13.072C55.7927 13.024 55.5047 13 55.2167 13C53.2967 13 52.3607 13.96 52.3607 15.856V22ZM59.6571 14.944H64.4811C64.4331 13.192 63.2811 12.352 62.0571 12.352C60.8091 12.352 59.7771 13.312 59.6571 14.944ZM67.6971 16.912H59.5611C59.6571 18.688 60.6651 19.84 62.2011 19.84C63.2091 19.84 64.0971 19.336 64.3131 18.52H67.5291C66.8091 20.944 64.8651 22.312 62.3451 22.312C58.4091 22.312 56.4411 20.152 56.4411 15.88C56.4411 12.232 58.5291 9.88 62.1531 9.88C65.7771 9.88 67.6971 12.232 67.6971 16.912ZM79.9594 22H76.8154V14.848C76.8154 13.024 76.2874 12.52 74.7994 12.52C73.1674 12.52 72.3754 13.432 72.3754 15.232V22H69.2554V10.192H72.2314V11.92C72.9514 10.6 74.1514 9.88 76.0474 9.88C78.3034 9.88 79.9594 11.248 79.9594 13.816V22ZM89.2937 17.728H92.4377C92.1017 20.464 89.8697 22.312 87.0137 22.312C83.7977 22.312 81.5897 20.176 81.5897 15.952C81.5897 11.728 83.7977 9.88 87.1097 9.88C90.1817 9.88 92.2697 11.632 92.4617 14.416H89.3177C89.1497 13.192 88.2617 12.472 87.0857 12.472C85.7657 12.472 84.6857 13.312 84.6857 15.88C84.6857 18.448 85.7657 19.696 86.9897 19.696C88.2137 19.696 89.1737 19 89.2937 17.728ZM104.544 22H101.4V14.68C101.4 12.904 100.8 12.352 99.3844 12.352C97.8244 12.352 96.9604 13.648 96.9604 15.232V22H93.8404V5.872H96.9604V11.728C97.4164 10.672 98.8564 9.88 100.44 9.88C102.864 9.88 104.544 11.296 104.544 13.648V22Z"
                fill="white"
              />
            </svg>
          </Link>
          <div className="flex w-fit items-center gap-2 ...">
            <Icons.Lock className="text-foreground-success" />
            <p className="">Private Beta</p>
          </div>
        </nav>

        <div
          className="relative mx-auto flex w-full max-w-screen-4xl flex-1 flex-col items-center justify-center rounded-3xl"
          style={{
            backgroundImage: "url('/backgrounds/bg.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="mx-auto flex w-full max-w-screen-4xl flex-1 flex-col items-center justify-center rounded-3xl">
            <div className="flex flex-col items-center justify-center"></div>
            <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-[#252525] bg-[#0e0d0d] p-10">
              <div className="flex flex-col gap-6">
                <p className="block text-center text-xl font-semibold leading-none tracking-tight text-foreground-light">
                  Login
                </p>
                <GoogleAuth inviteCode={inviteCode} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="block pb-4 text-center text-sm text-foreground-medium">
        Charts are powered by{" "}
        <Link
          href="https://www.tradingview.com/"
          target="_blank"
          className="underline"
        >
          TradingView
        </Link>
      </div>
      <div className="block pb-4 text-center text-sm text-foreground-medium">
        © {new Date().getFullYear()} Trench Inc. All rights reserved.
      </div>
    </>
  );
}
