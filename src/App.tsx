import { observer, useObserver } from "mobx-react-lite";
import React, { useState } from "react";
import {
  BaseElementModel,
  deserializeNoteModel,
  NoteModel,
  SerializedNote,
  serializeNoteModel,
  TextAreaElementModel,
} from "./core";
import "./App.css";
import { getDragHandler } from "./getDragHandler";

const Note = observer(function Note({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="Note" {...props} />;
});

const Wrapper = observer(function Wrapper({ children }) {
  return <div className="Wrapper">{children}</div>;
});

const TextArea = observer(function TextArea({
  model,
}: {
  model: TextAreaElementModel;
}) {
  return (
    <label className="TextArea__wrapper">
      <textarea
        className="TextArea"
        autoFocus
        style={{ width: model.width, height: model.height }}
        value={model.text}
        onChange={(e) => model.setText(e.target.value)}
      />
      <button
        className="TextArea__resize-handler"
        onMouseDown={getDragHandler(({ dX, dY }) => {
          model.width += dX;
          model.height += dY;
        })}
      />
    </label>
  );
});

const ElementControls = observer(({ children }) => (
  <div className="ElementControls">{children}</div>
));

const ElementWrapper = observer(function ElementWrapper({
  children,
  x,
  y,
}: {
  children: React.ReactNode;
  x: number;
  y: number;
}) {
  return (
    <div
      className="ElementWrapper"
      style={{ "--element-y": y, "--element-x": x } as React.CSSProperties}
    >
      {children}
    </div>
  );
});

const RoundIcon = observer(function RoundIcon({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="RoundIcon" {...props} />;
});

const ElementView = observer(function ElementView({
  element,
}: {
  element: BaseElementModel;
}) {
  if (element instanceof TextAreaElementModel) {
    return <TextArea model={element} />;
  }

  return null;
});

const NoteTitle = observer(function NoteTitle({ note }: { note: NoteModel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitleName, setNewTitleName] = useState(note.title);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    note.setTitle(newTitleName);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} onBlur={handleSubmit}>
        <input
          autoFocus
          className="NoteTitle__input"
          value={newTitleName}
          onChange={(e) => setNewTitleName(e.target.value)}
        />
      </form>
    );
  }

  return (
    <h2 onDoubleClick={() => setIsEditing(true)} className="NoteTitle__title">
      {note.title || <span className="NoteTitle__comment">Untitled</span>}
    </h2>
  );
});

const LS_KEY = "TINOTES_NOTE";

const App = observer(function App() {
  const [note] = useState(() => {
    const fromLS = localStorage.getItem(LS_KEY);
    if (fromLS) {
      return deserializeNoteModel(fromLS as SerializedNote);
    }
    return new NoteModel();
  });

  useObserver(() => {
    const serializedNote = serializeNoteModel(note);
    localStorage.setItem(LS_KEY, serializedNote);
  });

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.target !== e.currentTarget) {
      return;
    }

    const { clientX, clientY, currentTarget } = e;
    const { top, left } = currentTarget.getBoundingClientRect();

    note.addElement(
      new TextAreaElementModel({
        x: clientX - left,
        y: clientY - top,
      })
    );
  }

  function getElementDeleteHandler(element: BaseElementModel) {
    return () => {
      note.removeElement(element.id);
    };
  }

  function getStartMovingHandler(activeElement: BaseElementModel) {
    return getDragHandler(({ dX, dY }) => {
      activeElement.moveTo({
        x: activeElement.x + dX,
        y: activeElement.y + dY,
      });
    });
  }

  return (
    <Wrapper>
      <NoteTitle note={note} />
      <Note onDoubleClick={handleClick}>
        {note.elements.map((element) => (
          <ElementWrapper key={element.id} x={element.x} y={element.y}>
            <ElementControls>
              <RoundIcon
                style={{ cursor: "move" }}
                onMouseDown={getStartMovingHandler(element)}
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
});

export default App;
