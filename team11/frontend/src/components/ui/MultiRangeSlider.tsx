import * as React from "react";
import { Range, getTrackBackground, Direction } from "react-range";

export interface RangeSection {
    start: number;
    end: number;
    disabled?: boolean;
}

interface CustomThumbParams {
    sectionIndex: number;
    isDisabled: boolean;
    isStartThumb: boolean;
}

interface MultiRangeSliderProps {
    sections: RangeSection[];
    min: number;
    max: number;
    step?: number;
    onChange: (sections: RangeSection[]) => void;
    activeColor?: string;
    disabledColor?: string;
    gapColor?: string;
    className?: string;
    style?: React.CSSProperties;
    // Exposing renderThumb
    renderThumb?: (params: CustomThumbParams) => React.ReactNode;
}

const MultiRangeSlider: React.FC<MultiRangeSliderProps> = ({
    sections,
    min,
    max,
    step = 1,
    onChange,
    activeColor = "#276EF1",
    disabledColor = "#94a3b8",
    gapColor = "#e2e8f0",
    className = "",
    style = {},
    renderThumb,
}) => {
    // Flatten [start, end] pairs for react-range
    const flatValues = React.useMemo(
        () => sections.reduce((acc, s) => [...acc, s.start, s.end], [] as number[]),
        [sections]
    );

    const handleChange = (newFlatValues: number[]) => {
        const updatedSections = sections.map((section, i) => {
            if (section.disabled) return { ...section };
            return {
                ...section,
                start: newFlatValues[i * 2],
                end: newFlatValues[i * 2 + 1],
            };
        });
        onChange(updatedSections);
    };

    const colors = React.useMemo(() => {
        const trackColors = [gapColor];
        sections.forEach((s) => {
            trackColors.push(s.disabled ? disabledColor : activeColor);
            trackColors.push(gapColor);
        });
        return trackColors;
    }, [sections, activeColor, disabledColor, gapColor]);

    return (
        <div className={className} style={{ ...style, width: "100%" }}>
            <Range
                values={flatValues}
                step={step}
                min={min}
                max={max}
                direction={Direction.Left}
                onChange={handleChange}
                renderTrack={({ props, children }) => (
                    <div
                        onMouseDown={props.onMouseDown}
                        onTouchStart={props.onTouchStart}
                        style={{
                            ...props.style,
                            height: "36px",
                            display: "flex",
                            width: "100%",
                        }}
                    >
                        <div
                            ref={props.ref}
                            style={{
                                height: "6px",
                                width: "100%",
                                borderRadius: "4px",
                                background: getTrackBackground({
                                    values: flatValues,
                                    colors,
                                    min,
                                    max,
                                    direction: Direction.Left,
                                }),
                                alignSelf: "center",
                            }}
                        >
                            {children}
                        </div>
                    </div>
                )}
                renderThumb={(params) => {
                    const sectionIndex = Math.floor(params.index / 2);
                    const isDisabled = !!sections[sectionIndex]?.disabled;
                    const isStartThumb = params.index % 2 === 0;

                    // If user provided a custom renderThumb prop, use it
                    if (renderThumb) {
                        return renderThumb({ ...params, sectionIndex, isDisabled, isStartThumb });
                    }

                    // Default Thumb
                    return (
                        <div
                            {...params.props}
                            key={params.props.key}
                            style={{
                                ...params.props.style,
                                height: "24px",
                                width: "24px",
                                borderRadius: "50%",
                                backgroundColor: "#FFF",
                                boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                outline: "none",
                            }}
                        >
                            <div
                                style={{
                                    height: "10px",
                                    width: "2px",
                                    backgroundColor: isDisabled
                                        ? "#cbd5e1"
                                        : isStartThumb
                                            ? "#0C2960" : activeColor,
                                }}
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default MultiRangeSlider;
