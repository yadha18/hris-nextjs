import { employeeUpload } from "./employeeUpload";
import { laptopUpload } from "./laptopUpload";
import { lemburUpload } from "./lemburUpload";

export const UPLOAD_TYPES = {
  karyawan: employeeUpload,
  lembur: lemburUpload,
  laptop: laptopUpload,
};
