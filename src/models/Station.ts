export class Station {
  private _name: string;
  private _x: number;
  private _y: number;

  constructor(name: string, x: number, y: number) {
    this._name = name;
    this._x = x;
    this._y = y;
  }

  get name(): string {
    return this._name;
  }

  get coordinates(): { x: number; y: number } {
    return { x: this._x, y: this._y };
  }
}
