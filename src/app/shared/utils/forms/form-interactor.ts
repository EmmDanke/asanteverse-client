import { isSignal, Signal, signal, WritableSignal } from '@angular/core';
import { ToastService } from '../../services/toast.service';

export type ValidatorResponse = 'ok' | ValidatorWarn | ValidatorBlock;

export interface ValidatorWarn {
  type: 'warn';
  message: string;
}

export interface ValidatorBlock {
  type: 'block';
  message: string;
}

export type ValidatorFn<T> = (
  value: T
) => ValidatorResponse | Promise<ValidatorResponse>;

export type ListenerFn<T> = (value: T) => void;

export interface FormInteractorOptions<T> {
  initialValue: T;
  toastService: ToastService;
  listener?: ListenerFn<T> | Signal<ListenerFn<T>>;
  validator?: ValidatorFn<T> | Signal<ValidatorFn<T>>;
}

export class FormInteractor<T> {
  private readonly options: FormInteractorOptions<T>;

  readonly value!: WritableSignal<T>;
  readonly warnMessage: WritableSignal<string | undefined> = signal(undefined);

  get toastService(): ToastService {
    return this.options.toastService;
  }

  /**
   * Gets the validator function from the options.
   */
  get validatorFn(): ValidatorFn<T> | undefined {
    const validatorArg = this.options.validator;

    if (validatorArg === undefined) {
      return undefined;
    }

    if (isSignal(validatorArg)) {
      return validatorArg();
    }

    return validatorArg;
  }

  constructor(options: FormInteractorOptions<T>) {
    this.options = options;
    this.value = signal(options.initialValue);
  }

  async setValueByUser(value: T): Promise<void> {
    // Reset any previous warnings or blocks.
    this.warnMessage.set(undefined);

    // Before accepting user input, validate it.
    const validator: ValidatorFn<T> | undefined = this.validatorFn;
    const validatorResponse = await (validator?.(value) ??
      Promise.resolve('ok'));
    if (validatorResponse === 'ok') {
      this.setValue(value);
    } else if (validatorResponse.type === 'warn') {
      this.warnMessage.set(validatorResponse.message);
      this.setValue(value);
    } else if (validatorResponse.type === 'block') {
      this.toastService.showError(validatorResponse.message);
    } else {
      throw new Error(`Invalid validator response: ${validatorResponse}`);
    }
  }

  private setValue(value: T): void {
    this.value.set(value);
    this.options.listener?.(value);
  }
}
