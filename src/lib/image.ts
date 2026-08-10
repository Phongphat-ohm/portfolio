const CLOUD_ORIGIN = "https://cloud.ppkxb.space";

export function imageSrc(image: string | null): string | null {
  if (!image) return null;
  if (/^https?:\/\//.test(image)) {
    if (image.startsWith(CLOUD_ORIGIN)) {
      try {
        const url = new URL(image);
        url.searchParams.set("v", "thumb");
        return url.toString();
      } catch {
        return image;
      }
    }
    return image;
  }
  if (
    image.length <= 255 &&
    !image.includes("..") &&
    !image.includes("/") &&
    !image.includes("\\") &&
    /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(image)
  ) {
    return `/api/uploads/${image}`;
  }
  return null;
}
