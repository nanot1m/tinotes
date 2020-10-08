import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

const Note = styled.div`
  border-radius: 0.5em;
  background-color: white;
  width: 400px;
  height: 600px;
  box-shadow: 0.125em 0.125em 0 0.125em rgba(0, 0, 0, 0.1);
  position: relative;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 4em;
  padding-bottom: 4em;
  background-color: bisque;
  box-sizing: border-box;
  min-height: 100vh;
`;

const TextArea = styled.textarea<{ x: number; y: number }>`
  border: 1px dashed #dfdede;
  background-color: transparent;
  font-size: 14px;
`;

const ElementControls = styled.div`
  position: absolute;
  right: -0.5em;
  top: -0.5em;
  transform: translate(0, -100%);
  display: flex;
  gap: 0.5em;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(-100%);
  }
`;

const ElementWrapperContainer = styled.div`
  position: absolute;
  top: calc(var(--element-y) * 1px);
  left: calc(var(--element-x) * 1px);

  ${ElementControls} {
    visibility: hidden;
  }

  &:focus-within {
    z-index: 10;

    ${ElementControls} {
      visibility: visible;
      animation: 0.1s ease-in ${fadeIn};
    }
  }
`;

const RoundIcon = styled.button`
  display: grid;
  place-items: center;
  width: 2em;
  height: 2em;
  background-color: white;
  border: none;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.2);
  border-radius: 50%;

  &:hover {
    background-color: #fafafa;
    cursor: pointer;
  }
`;

function ElementWrapper({
  children,
  x,
  y,
}: {
  children: React.ReactNode;
  x: number;
  y: number;
}) {
  return (
    <ElementWrapperContainer
      style={
        {
          "--element-y": y,
          "--element-x": x,
        } as React.CSSProperties
      }
    >
      {children}
    </ElementWrapperContainer>
  );
}

enum ElementType {
  TextArea,
}

type BaseElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
};

function ElementView({ element }: { element: BaseElement }) {
  switch (element.type) {
    case ElementType.TextArea:
      return <TextArea rows={4} cols={20} x={element.x} y={element.y} />;
    default:
      return null;
  }
}

function getId() {
  return (Date.now() + Math.random() * 1000).toString(16);
}

function App() {
  const [elements, setElements] = useState<BaseElement[]>([]);

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.target !== e.currentTarget) {
      return;
    }

    const { clientX, clientY, currentTarget } = e;
    const { top, left } = currentTarget.getBoundingClientRect();

    setElements((elements) =>
      elements.concat({
        type: ElementType.TextArea,
        x: clientX - left,
        y: clientY - top,
        id: getId(),
      })
    );
  }

  function getElementDeleteHandler(element: BaseElement) {
    return () => {
      setElements((elements) =>
        elements.filter((previousElement) => previousElement.id !== element.id)
      );
    };
  }

  function getStartMovingHandler(activeElementId: string) {
    return (mouseDownEvent: React.MouseEvent<HTMLButtonElement>) => {
      let currentX = mouseDownEvent.clientX;
      let currentY = mouseDownEvent.clientY;

      function moveElement(mouseMoveEvent: MouseEvent) {
        const dX = mouseMoveEvent.clientX - currentX;
        const dY = mouseMoveEvent.clientY - currentY;
        currentX = mouseMoveEvent.clientX;
        currentY = mouseMoveEvent.clientY;

        setElements((elements) => {
          const elementIdx = elements.findIndex(
            (element) => element.id === activeElementId
          );
          const activeElement = elements[elementIdx];
          if (!activeElement) {
            return elements;
          }
          return [
            ...elements.slice(0, elementIdx),
            {
              ...activeElement,
              x: activeElement.x + dX,
              y: activeElement.y + dY,
            },
            ...elements.slice(elementIdx + 1),
          ];
        });
      }

      function stopMoving() {
        document.removeEventListener("mousemove", moveElement);
        document.removeEventListener("mouseup", stopMoving);
        document.removeEventListener("blur", stopMoving);
        document.removeEventListener("mouseleave", stopMoving);
      }

      document.addEventListener("mousemove", moveElement);
      document.addEventListener("mouseup", stopMoving);
      document.addEventListener("blur", stopMoving);
      document.addEventListener("mouseleave", stopMoving);
    };
  }

  return (
    <Wrapper>
      <Note onClick={handleClick}>
        {elements.map((element) => (
          <ElementWrapper key={element.id} x={element.x} y={element.y}>
            <ElementControls>
              <RoundIcon
                style={{ cursor: "move" }}
                onMouseDown={getStartMovingHandler(element.id)}
              >
                📌
              </RoundIcon>
              <RoundIcon onClick={getElementDeleteHandler(element)}>
                🗑
              </RoundIcon>
            </ElementControls>
            <ElementView element={element} />
          </ElementWrapper>
        ))}
      </Note>
    </Wrapper>
  );
}

export default App;
