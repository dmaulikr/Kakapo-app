import Reflux from "reflux";
import { getYoutubeURL, getCustomURL, getSoundCloudURL } from "../api";

const soundActions = Reflux.createActions({
  getYoutubeURL: {
    asyncResult: true,
    children: ["progressed"]
  },
  getCustomURL: {
    asyncResult: true,
    children: ["progressed"]
  },
  getSoundCloudURL: {
    asyncResult: true,
    children: ["progressed"]
  },
  toggleMute: { sync: true },
  togglePlayPause: { sync: true },
  changeVolume: { sync: true },
  removeSound: { sync: true },
  editSound: { sync: true }
});

soundActions.getSoundCloudURL.listenAndPromise(getSoundCloudURL);
soundActions.getYoutubeURL.listenAndPromise(getYoutubeURL);
soundActions.getCustomURL.listenAndPromise(getCustomURL);

export default soundActions;
