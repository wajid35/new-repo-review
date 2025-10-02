import { ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";

const classes = cva("border h-12 rounded-full px-6 font-medium", {
    variants: {
        variant: {
            primary: "bg-[#FF5F1F] text-white border-[#FF5F1F] hover:bg-[#e34f14] transition",
            secondary: "border-[#FF5F1F] text-[#FF5F1F] bg-white hover:bg-[#FF5F1F] hover:text-white transition",
        },
        size: {
            sm: "h-10",
        },
    },
});

export default function Button(
    props: { variant: "primary" | "secondary"; size?: "sm" } & ButtonHTMLAttributes<HTMLButtonElement>
) {
    const { variant, className, size, ...otherprops } = props;

    return (
        <button className={classes({ variant, className, size })} {...otherprops} />
    );
}
