import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function Tag(props: HTMLAttributes<HTMLDivElement>) {


    const { className, children, ...otherProps } = props;

    return (
        <div className={twMerge('inline-flex items-center border border-[#FF5F1F] text-[#FF5F1F] gap-2 px-3 py-1 rounded-full uppercase', className)} {...otherProps}>
            <span className="text-sm">&#10038;</span>
            <span className="text-sm">{children}</span>
        </div>
    )
}