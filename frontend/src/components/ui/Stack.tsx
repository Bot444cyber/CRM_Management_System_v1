"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import React from 'react';

type Item = {
    id: number;
    content: React.ReactNode;
};

interface StackProps {
    randomRotation?: boolean;
    sensitivity?: number;
    sendToBackOnClick?: boolean;
    cardDimensions?: { width: number; height: number };
    cardsData?: Item[];
    animationConfig?: { stiffness: number; damping: number };
    autoplayOptions?: { autoplay?: boolean; pauseOnHover?: boolean; delay?: number };
    onCardChange?: (id: number) => void;
}

export default function Stack({
    randomRotation = false,
    sensitivity = 200,
    sendToBackOnClick = false,
    cardDimensions = { width: 208, height: 208 },
    cardsData = [],
    animationConfig = { stiffness: 260, damping: 20 },
    autoplayOptions = { autoplay: false, pauseOnHover: false, delay: 1000 },
    onCardChange,
}: StackProps) {
    const [cards, setCards] = useState(
        cardsData.length
            ? cardsData
            : [
                { id: 1, content: <div>Card 1</div> },
                { id: 2, content: <div>Card 2</div> },
                { id: 3, content: <div>Card 3</div> },
                { id: 4, content: <div>Card 4</div> },
            ]
    );

    const sendToBack = (id: number) => {
        setCards((prev) => {
            const newCards = [...prev];
            const index = newCards.findIndex((card) => card.id === id);
            const [card] = newCards.splice(index, 1);
            newCards.unshift(card);
            return newCards;
        });
    };

    const topCardId = cards.length > 0 ? cards[cards.length - 1].id : null;

    React.useEffect(() => {
        if (topCardId !== null && onCardChange) {
            onCardChange(topCardId);
        }
    }, [topCardId]); // eslint-disable-line react-hooks/exhaustive-deps

    const [isHovered, setIsHovered] = useState(false);

    React.useEffect(() => {
        if (!autoplayOptions.autoplay) return;

        if (autoplayOptions.pauseOnHover && isHovered) return;

        const interval = setInterval(() => {
            if (cards.length > 0) {
                // Send the top card (last in the array visually) to the back
                sendToBack(cards[cards.length - 1].id);
            }
        }, autoplayOptions.delay || 1000);

        return () => clearInterval(interval);
    }, [autoplayOptions.autoplay, autoplayOptions.pauseOnHover, autoplayOptions.delay, isHovered, cards]);

    return (
        <div
            className="relative"
            style={{
                width: cardDimensions.width,
                height: cardDimensions.height,
                perspective: 600,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {cards.map((card, index) => {
                const randomRotate = randomRotation
                    ? Math.random() * 10 - 5
                    : 0;

                return (
                    <motion.div
                        key={card.id}
                        className="absolute shadow-2xl rounded-2xl overflow-hidden"
                        style={{
                            width: cardDimensions.width,
                            height: cardDimensions.height,
                            transformOrigin: "center center",
                        }}
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: (cards.length - 1 - index) * -15, // Staggers them upwards
                            x: (cards.length - 1 - index) * 15, // Staggers them rightwards
                            rotateZ: (cards.length - 1 - index) * 2 + randomRotate, // Rotate rightward
                            scale: 1 - (cards.length - 1 - index) * 0.05,
                            z: (cards.length - 1 - index) * -30,
                        }}
                        transition={{
                            type: "spring",
                            ...animationConfig,
                        }}
                        drag
                        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        dragElastic={1}
                        onDragEnd={() => {
                            if (sendToBackOnClick) {
                                sendToBack(card.id);
                            }
                        }}
                        onClick={() => {
                            if (sendToBackOnClick) {
                                sendToBack(card.id);
                            }
                        }}
                        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                    >
                        {card.content}
                    </motion.div>
                );
            })}
        </div>
    );
}
