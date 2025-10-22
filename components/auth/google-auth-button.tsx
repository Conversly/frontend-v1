import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

export default function GoogleAuthButton({
  nonce,
  onSuccess,
}: {
  nonce: string;
  onSuccess: (credentialResponse: CredentialResponse) => void;
}) {
  return (
    <GoogleLogin
      nonce={nonce}
      width={235}
      containerProps={{
        className: "w-full flex justify-center rounded-md",
      }}
      onSuccess={onSuccess}
      useOneTap={false}
      auto_select={false}
    />
  );
}
