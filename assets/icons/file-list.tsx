import { LucideProps } from "lucide-react";

const FileList = (props: LucideProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="2" y="2" width="12" height="12" rx="2" fill="#C7C7C7" />
    <rect x="4" y="5" width="8" height="1.2" rx="0.6" fill="#747474" />
    <rect x="4" y="8" width="8" height="1.2" rx="0.6" fill="#747474" />
    <rect x="4" y="11" width="5" height="1.2" rx="0.6" fill="#747474" />
  </svg>
);

export default FileList;
