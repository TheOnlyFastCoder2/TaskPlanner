import React from "react";

interface IProps extends React.PropsWithChildren {
    className?: string,
}

export function H1({ children, className}: IProps) {
    return (
        <h1 className={`H1 scroll-m-20 font-extrabold tracking-tight ${className||''}`} style={{ fontSize: 'clamp(2rem, 5vw + 1rem, 3rem)' }}>
            {children}
        </h1>
    );
}

export function H2({ children, className}: IProps) {
    return (
        <h2 className={`H2 scroll-m-20 border-b pb-2 font-semibold tracking-tight ${className||''}`} style={{ fontSize: 'clamp(1.5rem, 4vw + 1rem, 2.5rem)' }}>
            {children}
        </h2>
    );
}

export function H3({ children, className}: IProps) {
    return (
        <h3 className={`H3 scroll-m-20 font-semibold tracking-tight ${className||''}`} style={{ fontSize: 'clamp(1.25rem, 3vw + 1rem, 2rem)' }}>
            {children}
        </h3>
    );
}

export function H4({ children, className}: IProps) {
    return (
        <h4 className={`H4 font-semibold tracking-tight ${className||''}`} style={{ fontSize: 'clamp(1rem, 2.5vw + 1rem, 1.5rem)' }}>
            {children}
        </h4>
    );
}
export function H5({ children, className}: IProps) {
    return (
        <h5 className={`H5 font-semibold ${className||''}`} style={{ fontSize: 'clamp(0.875rem, 2vw + 0.75rem, 1.25rem);' }}>
            {children}
        </h5>
    );
}

export function H6({ children, className}: IProps) {
    return (
        <h6 className={`H6 font-semibold ${className||''}`} style={{ fontSize: 'clamp(0.75rem, 1.5vw + 0.5rem, 1rem)' }}>
            {children}
        </h6>
    );
}


export function P({ children, className}: IProps) {
    return (
        <p className={`P leading-7 ${className||''}`} style={{ fontSize: 'clamp(0.875rem, 2vw + 0.5rem, 1rem)' }}>
            {children}
        </p>
    );
}

export function Span({ children, className}: IProps) {
    return (
        <span className={`Span italic ${className||''}`} style={{ fontSize: 'clamp(0.875rem, 2vw + 0.5rem, 1rem)' }}>
            {children}
        </span>
    );
}

export function Blockquote({ children, className}: IProps) {
    return (
        <blockquote className={`Blockquote mt-6 border-l-2 pl-6 italic ${className||''}`} style={{ fontSize: 'clamp(1rem, 2.5vw + 0.5rem, 1.25rem)' }}>
            {children}
        </blockquote>
    );
}
