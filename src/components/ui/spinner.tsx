export function Spinner({ className = "" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Outer spinning dashed ring */}
            <svg
                className="animate-spin text-[#C9AA8B] w-full h-full"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="16 16"
                    className="opacity-25"
                />
                <path
                    d="M12 2C6.47715 2 2 6.47715 2 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-75"
                />
            </svg>
            {/* Inner pulsing dot */}
            <div className="absolute w-[30%] h-[30%] bg-[#E8D5C0] rounded-full animate-pulse shadow-[0_0_8px_rgba(201,170,139,0.5)]" />
        </div>
    );
}
