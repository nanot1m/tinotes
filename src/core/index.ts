import { action, makeAutoObservable, makeObservable, observable } from "mobx";
import { getId } from "./getId";

export abstract class BaseElementModel {
  public id = getId();
  public x = 0;
  public y = 0;
  public abstract type: string;

  public constructor({ x, y }: { x: number; y: number }) {
    makeObservable(this, {
      x: observable,
      y: observable,
      moveTo: action,
    });
    this.x = x;
    this.y = y;
  }

  public moveTo({ x, y }: { x: number; y: number }) {
    this.x = x;
    this.y = y;
  }
}

export class TextAreaElementModel extends BaseElementModel {
  public type = "TextArea";

  public text: string = "";

  constructor({ x, y, text = "" }: { x: number; y: number; text?: string }) {
    super({ x, y });
    makeObservable(this, { text: observable, setText: action });
    this.text = text;
  }

  public setText(text: string) {
    this.text = text;
  }
}

export class NoteModel {
  public id = getId();

  public title = "";

  private _elements: Map<string, BaseElementModel> = new Map();

  public constructor(title: string) {
    makeAutoObservable(this);
    this.title = title;
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
