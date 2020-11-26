import enhanceAgoraRTC from 'agoran-awe';
import AgoraRTC from 'agora-rtc-sdk';

AgoraRTC.Logger.enableLogUpload();

// promisify class Client & Stream
const engine = enhanceAgoraRTC(AgoraRTC);
export default engine;
