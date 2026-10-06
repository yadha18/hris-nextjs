import {
  namedListItemAdded,
  namedListItemRemoved,
  saveState,
} from "@/store/slices/hrisSlice";

export const addNamedListItem =
  ({ listKey, rawName }) =>
  (dispatch, getState) => {
    const name = rawName.trim().toUpperCase();
    if (!name) return { success: false, error: "empty" };
    if (getState().hris[listKey].some((item) => item.nama === name))
      return { success: false, error: "duplicate" };

    dispatch(namedListItemAdded({ listKey, name }));
    dispatch(saveState());
    return { success: true };
  };

export const removeNamedListItem =
  ({ listKey, name }) =>
  (dispatch) => {
    dispatch(namedListItemRemoved({ listKey, name }));
    dispatch(saveState());
  };
