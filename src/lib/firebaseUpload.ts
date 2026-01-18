import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadNoteFile(
  file: File,
  userId: string
): Promise<{ url: string; name: string }> {
  const fileRef = ref(
    storage,
    `notes/${userId}/${Date.now()}-${file.name}`
  );

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  return {
    url,
    name: file.name,
  };
}
