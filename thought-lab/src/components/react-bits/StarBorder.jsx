import React from "react";
import "./StarBorder.css";

const StarBorder = ({ as: Component = "div", className = "", color = "rgba(168, 85, 247, 1)", speed = "4s", children, ...rest }) => {
    return (
        <Component className={`star-border-container ${className}`} {...rest}>
            <div
                className="star-border-animator"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 100%)`,
                    animationDuration: speed,
                }}
            ></div>
            <div className="star-border-inner">{children}</div>
        </Component>
    );
};

export default StarBorder;
