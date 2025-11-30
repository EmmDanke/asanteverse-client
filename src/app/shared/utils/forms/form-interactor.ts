import {
  BehaviorSubject,
  combineLatest,
  filter,
  Observable,
  of,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

export type Validity = 'ok' | 'not-computed' | Invalid;

export interface Invalid {
  type: 'invalid';
  message: string;
}

export type ValidatorFn<T> = (value: T) => Validity | Promise<Validity>;

type ChildValueGroup<C> = Record<keyof C, ChildValue<C[keyof C]>>;

export interface ComponentValueOptions<T> {
  /**
   * Initial component value.
   */
  initialValue: T;
  /**
   * Options for computing the component value instead of setting it manually.
   */
  computation?: ValueComputationOptions<T, unknown, unknown>;
  /**
   * Options for computing the validity of the component value.
   */
  validity?: ValidityComputationOptions<T, unknown>;
  /**
   * Callback triggered when the component value changes.
   */
  onValueChange?: (value: T) => void;
  /**
   * Observable triggered when the component is destroyed, in order to properly unsubscribe from internal observables.
   */
  destroyed$: Observable<void>;
}

export interface ChildValueOptions<T> {
  /**
   * Initial child value.
   */
  initialValue: T;
  /**
   * Observable triggered when the child is destroyed, in order to properly unsubscribe from internal observables.
   */
  destroyed$: Observable<void>;
}

export interface ValueComputationOptions<T, C, V> {
  /**
   * Child components providing sub-values for the component value.
   */
  children: ChildValueGroup<C>;
  /**
   * Additional variables for the component value computation as an {@link Observable}.
   * They will trigger a new computation when they emit a new value.
   */
  additionalVars?: Observable<V>;
  /**
   * Function to compute the component value from the children values and additional variables.
   */
  computeValue: (children: C, additionalVars: V) => T | Promise<T>;
}

export interface ValidityComputationOptions<T, V> {
  /**
   * Additional variables for the component validity computation as an {@link Observable}.
   * They will trigger a new computation when they emit a new value.
   */
  additionalVars?: Observable<V>;
  /**
   * Function to compute the component validity from the component value and additional variables.
   */
  computeValidity: (value: T, additionalVars?: V) => Promise<Validity>;
}

export class ComponentValue<T> {
  static create<T>(options: ComponentValueOptions<T>): ComponentValue<T> {
    return new ComponentValue(options);
  }

  private readonly options: ComponentValueOptions<T>;

  private readonly _value: BehaviorSubject<T>;
  private readonly _validity: BehaviorSubject<Validity>;

  private readonly _validityChange: Observable<Validity>;

  /**
   * Computed value of the component, or manually set value.
   */
  get value(): T {
    return this._value.value;
  }

  set value(value: T) {
    if (this.isComputedValue) {
      throw new Error('Cannot set value manually with option computed value');
    }

    this._value.next(value);
  }

  get isComputedValue(): boolean {
    return !!this.options.computation;
  }

  /**
   * Observable of the component value.
   * This observable will emit the value upon subscription.
   */
  get value$(): Observable<T> {
    return this._value.pipe(startWith(this.value));
  }

  /**
   * Validity of the component value.
   * If the validator is not provided, the validity will be 'ok'.
   * <br><br>
   * If the value is computed, the children validity will be added to the validity.
   * For example, if the value is valid but the children are invalid, the validity will be invalid.
   */
  get validity(): Validity {
    return this._validity.value;
  }

  /**
   * Observable of the component validity.
   * This observable will emit the validity upon subscription.
   */
  get validity$(): Observable<Validity> {
    return this._validity.pipe(startWith(this.validity));
  }

  private constructor(options: ComponentValueOptions<T>) {
    this.options = options;
    this._value = new BehaviorSubject(options.initialValue);
    this._validity = new BehaviorSubject<Validity>('not-computed');
    this._validityChange = this.initValidityChange();

    this.initValueChange();
    this.initValidity();
    this.initDestroyed();
  }

  private initValidityChange(): Observable<Validity> {
    const validityOptions = this.options.validity;
    if (!validityOptions) {
      return of('ok');
    }

    return combineLatest([
      this.value$,
      validityOptions.additionalVars ?? of(undefined),
    ]).pipe(
      takeUntil(this.options.destroyed$),
      switchMap(([value, additionalVars]) => {
        return fromPromise(
          validityOptions.computeValidity(value, additionalVars)
        );
      })
    );
  }

  private initValueChange(): void {
    this.value$.pipe(takeUntil(this.options.destroyed$)).subscribe(value => {
      this.options.onValueChange?.(value);
    });
  }

  private initValidity(): void {
    this._validityChange
      .pipe(takeUntil(this.options.destroyed$))
      .subscribe(validity => {
        this._validity.next(validity);
      });
  }

  private initDestroyed(): void {
    this.options.destroyed$
      .pipe(takeUntil(this.options.destroyed$))
      .subscribe(() => {
        this._value.complete();
        this._validity.complete();
      });
  }
}

export interface ChildValue<T> {
  /**
   * Value of the child component.
   */
  get value(): T;
  /**
   * Observable of the child component value.
   * This observable will emit the value upon subscription.
   */
  get value$(): Observable<T>;
  /**
   * Validity of the child component value.
   */
  get validity(): Validity;
  /**
   * Observable of the child component validity.
   * This observable will emit the validity upon subscription.
   */
  get validity$(): Observable<Validity>;
}

export class ChildValueImpl<T> implements ChildValue<T> {
  private readonly options: ChildValueOptions<T>;

  private readonly _value: BehaviorSubject<T>;
  private readonly _validity: BehaviorSubject<Validity>;

  // TODO Unsubscribe on destroy

  /**
   * Value of the child component.
   */
  get value(): T {
    const value = this._value.value;
    if (value === 'child-not-initialized') {
      throw new Error('Child value not initialized');
    }
    return value;
  }
  /**
   * Observable of the child component value.
   * This observable will emit the value upon subscription unless the child is not initialized.
   */
  get value$(): Observable<T> {
    return this._value.pipe(
      filter((value): value is T => value !== 'child-not-initialized'),
      startWith(this.value)
    );
  }

  /**
   * Validity of the child component value.
   */
  get validity(): Validity {
    return this._validity.value;
  }
  /**
   * Observable of the child component validity.
   * This observable will emit the validity upon subscription.
   */
  get validity$(): Observable<Validity> {
    return this._validity.pipe(
      filter((validity): validity is Validity => validity !== 'not-computed'),
      startWith(this.validity)
    );
  }

  private constructor(options: ChildValueOptions<T>) {
    this.options = options;
    this._value = new BehaviorSubject(options.initialValue);
    this._validity = new BehaviorSubject<Validity | 'not-computed'>(
      'not-computed'
    );

    this.initDestroyed();
  }

  createOptionsComponentValue(): ComponentValueOptions<T> {
    return {
      initialValue: this.options.initialValue,
      computation: {
        children: ,
      },
    };
  }

  private initDestroyed(): void {
    this.options.destroyed$
      .pipe(takeUntil(this.options.destroyed$))
      .subscribe(() => {
        this._value.complete();
        this._validity.complete();
      });
  }
}
