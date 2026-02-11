export function GridBackground() {
    return (
        <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>
    );
}
