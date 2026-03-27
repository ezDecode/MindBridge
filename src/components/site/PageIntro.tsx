import { ReactNode } from "react";
import { Text } from "@/components/ui";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, actions }: PageIntroProps) {
  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.97))] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[52rem]">
          <Text as="p" variant="label" color="brand">
            {eyebrow}
          </Text>
          <Text as="h1" variant="h2" weight="medium" className="mt-3">
            {title}
          </Text>
          <Text as="p" variant="lead" color="secondary" className="mt-3 max-w-[62ch]">
            {description}
          </Text>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
