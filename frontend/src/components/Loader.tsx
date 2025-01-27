const Loader: React.FC = () => {
    return (
        <div className="loader-container">
            <svg
                className="loader"
                version="1.1"
                id="L3"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 100 100"
                xmlSpace="preserve"
            >
                {/* Outer circle with transparency */}
                <circle
                    fill="none"
                    stroke="#00aab7"
                    strokeWidth="4"
                    cx="50"
                    cy="50"
                    r="44"
                    style={{ opacity: 0.5 }}
                />
                {/* Rotating inner circle */}
                <circle fill="#fff" stroke="#00848e" strokeWidth="3" cx="8" cy="54" r="6">
                    <animateTransform
                        attributeName="transform"
                        dur="2s"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </div>
    );
};

export default Loader;