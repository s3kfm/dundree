import { URLSearchParams as URLSearchParamsType } from "url";

export const constructSearchParams = (
  params: Record<string, string | number | string[] | number[] | undefined>,
  existingParams?: URLSearchParamsType,
) => {
  const newSearchParams = new URLSearchParams(existingParams);

  // Update or remove parameters based on the `params` object passed in
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      // If value is undefined, delete the key from search params
      newSearchParams.delete(key);
    } else if (Array.isArray(value)) {
      // For arrays, delete the existing key and append all values
      newSearchParams.delete(key);
      value.forEach((v) =>
        v ? newSearchParams.append(key, v.toString()) : "",
      );
    } else {
      // For single values, set or update the key
      newSearchParams.set(key, value.toString());
    }
  });
  return newSearchParams;
};
export const searchParamsToObject = (searchParams: URLSearchParamsType) => {
  const paramsObject: Record<string, string | string[]> = {};
  for (const [key, value] of Array.from(searchParams.entries())) {
    if (paramsObject[key]) {
      if (Array.isArray(paramsObject[key])) {
        (paramsObject[key] as string[]).push(value);
      } else {
        paramsObject[key] = [paramsObject[key] as string, value];
      }
    } else {
      paramsObject[key] = value;
    }
  }
  return paramsObject;
};
