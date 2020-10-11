import {
  action,
  makeAutoObservable,
  makeObservable,
  observable,
  toJS,
} from "mobx";
import { getId } from "./getId";

export abstract class BaseElementModel {
  public static readonly type: string;

  public readonly id;

  public x = 0;

  public y = 0;

  public type: string;

  public width: number;

  public height: number;

  public constructor({
    x,
    y,
    id = getId(),
    width,
    height,
  }: {
    x: number;
    y: number;
    id?: string;
    width: number;
    height: number;
  }) {
    makeObservable(this, {
      x: observable,
      y: observable,
      width: observable,
      height: observable,
      moveTo: action,
    });
    this.x = x;
    this.y = y;
    this.id = id;
    this.width = width;
    this.height = height;
    this.type = (this.constructor as typeof BaseElementModel).type;
  }

  public moveTo({ x, y }: { x: number; y: number }) {
    this.x = x;
    this.y = y;
  }
}

export class TextAreaElementModel extends BaseElementModel {
  public static readonly type = "TextArea";

  public text: string = "";

  constructor({
    x,
    y,
    id,
    text = "",
    width = 200,
    height = 60,
  }: {
    x: number;
    y: number;
    id?: string;
    text?: string;
    width?: number;
    height?: number;
  }) {
    super({ x, y, id, width, height });
    makeObservable(this, {
      text: observable,
      setText: action,
    });
    this.text = text;
  }

  public setText(text: string) {
    this.text = text;
  }
}

export class NoteModel {
  public id = "";

  public title = "";

  private _elements: Map<string, BaseElementModel> = new Map();

  public constructor({
    title = "",
    id = getId(),
  }: { title?: string; id?: string } = {}) {
    makeAutoObservable(this);
    this.title = title;
    this.id = id;
  }

  public get elements() {
    return Array.from(this._elements.values());
  }

  public addElement(element: BaseElementModel) {
    this._elements.set(element.id, element);
  }

  public removeElement(elementId: string) {
    this._elements.delete(elementId);
  }

  public setTitle(title: string) {
    this.title = title;
  }
}

export type SerializedNote = string & { __type__: "SerializedNote" };

export function serializeNoteModel(note: NoteModel): SerializedNote {
  console.log(toJS(note));
  return JSON.stringify({
    id: note.id,
    title: note.title,
    elements: note.elements.map((element) => toJS(element)),
  }) as SerializedNote;
}

export function deserializeNoteModel(
  serializedNote: SerializedNote
): NoteModel {
  const { elements, title, id } = JSON.parse(serializedNote);
  const note = new NoteModel({ title, id });

  elements.forEach((element: any) => {
    switch (element.type) {
      case TextAreaElementModel.type: {
        note.addElement(new TextAreaElementModel({ ...element }));
        break;
      }
    }
  });

  return note;
}
