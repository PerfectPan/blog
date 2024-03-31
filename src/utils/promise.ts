interface PromiseWithResolver<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export const withResolver = <T>() => {
  let resolve, reject;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject } as unknown as PromiseWithResolver<T>;
}
