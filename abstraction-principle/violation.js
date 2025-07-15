/**
 * Abstraction Principle - Violation
 *
 * Abstraction is the concept of hiding complex implementation details and exposing only
 * the necessary parts of an object. It allows us to model real-world entities by focusing
 * on what an object does rather than how it does it.
 *
 * This file demonstrates a violation of abstraction by exposing too many implementation details,
 * creating tight coupling, and forcing clients to understand the internal workings.
 */

// Poor abstraction - no clear separation between interface and implementation
class MediaPlayer {
  constructor(mediaFile) {
    this.mediaFile = mediaFile;
    this.isPlaying = false;
    this.currentPosition = 0;
    this.volume = 70;

    // Directly exposing implementation details
    this.audioBuffer = null;
    this.videoBuffer = null;
    this.audioCodec = null;
    this.videoCodec = null;
    this.decoderState = 'uninitialized';
    this.bufferSize = 8192;
    this.frameRate = 30;
    this.audioSampleRate = 44100;
    this.streamSynchronized = false;
  }

  // No abstraction - client needs to know file type and call the right method
  playAudio() {
    if (!this.mediaFile.endsWith('.mp3') &&
        !this.mediaFile.endsWith('.wav') &&
        !this.mediaFile.endsWith('.ogg')) {
      throw new Error('Not an audio file');
    }

    // Exposing implementation details to the client
    this.audioCodec = this.mediaFile.endsWith('.mp3') ? 'MP3' :
                     this.mediaFile.endsWith('.wav') ? 'WAV' : 'OGG';

    console.log(`Initializing ${this.audioCodec} codec`);

    // Client has to deal with buffer allocation
    this.audioBuffer = new Array(this.bufferSize);
    console.log(`Allocated audio buffer of size ${this.bufferSize}`);

    // Client has to deal with decoder state
    this.decoderState = 'initialized';
    console.log(`Decoder state: ${this.decoderState}`);

    // Client has to manually load the file
    this.loadAudioFile();

    // Client has to manually start playback
    this.startAudioPlayback();

    this.isPlaying = true;
    console.log(`Playing audio: ${this.mediaFile}`);
  }

  playVideo() {
    if (!this.mediaFile.endsWith('.mp4') &&
        !this.mediaFile.endsWith('.avi') &&
        !this.mediaFile.endsWith('.mkv')) {
      throw new Error('Not a video file');
    }

    // Exposing implementation details to the client
    this.videoCodec = this.mediaFile.endsWith('.mp4') ? 'H.264' :
                     this.mediaFile.endsWith('.avi') ? 'XVID' : 'VP9';

    console.log(`Initializing ${this.videoCodec} codec`);

    // Client has to deal with buffer allocation
    this.videoBuffer = new Array(this.bufferSize * 3); // 3x for RGB channels
    console.log(`Allocated video buffer of size ${this.bufferSize * 3}`);

    // Client has to deal with decoder state
    this.decoderState = 'initialized';
    console.log(`Decoder state: ${this.decoderState}`);

    // Client has to manually load the file
    this.loadVideoFile();

    // Client has to manually synchronize audio and video
    this.synchronizeAudioVideo();

    // Client has to manually start playback
    this.startVideoPlayback();

    this.isPlaying = true;
    console.log(`Playing video: ${this.mediaFile}`);
  }

  // Implementation details exposed as public methods
  loadAudioFile() {
    console.log(`Loading audio file: ${this.mediaFile}`);
    console.log(`Setting audio sample rate to ${this.audioSampleRate}Hz`);
    this.decoderState = 'loaded';
  }

  loadVideoFile() {
    console.log(`Loading video file: ${this.mediaFile}`);
    console.log(`Setting frame rate to ${this.frameRate}fps`);
    this.decoderState = 'loaded';
  }

  synchronizeAudioVideo() {
    console.log('Synchronizing audio and video streams');
    this.streamSynchronized = true;
  }

  startAudioPlayback() {
    if (this.decoderState !== 'loaded') {
      throw new Error('Audio file not loaded');
    }
    console.log('Starting audio playback engine');
    this.decoderState = 'playing';
  }

  startVideoPlayback() {
    if (this.decoderState !== 'loaded') {
      throw new Error('Video file not loaded');
    }
    if (!this.streamSynchronized) {
      throw new Error('Streams not synchronized');
    }
    console.log('Starting video playback engine');
    this.decoderState = 'playing';
  }

  pause() {
    if (this.decoderState !== 'playing') {
      throw new Error('Not currently playing');
    }
    console.log(`Paused media: ${this.mediaFile}`);
    this.isPlaying = false;
    this.decoderState = 'paused';
  }

  stop() {
    if (this.decoderState === 'uninitialized') {
      throw new Error('Player not initialized');
    }
    console.log(`Stopped media: ${this.mediaFile}`);
    this.isPlaying = false;
    this.currentPosition = 0;
    this.decoderState = 'stopped';

    // Client has to manually clean up resources
    this.cleanupResources();
  }

  cleanupResources() {
    console.log('Cleaning up codec resources');
    this.audioBuffer = null;
    this.videoBuffer = null;
    this.streamSynchronized = false;
    this.decoderState = 'uninitialized';
  }
}

// Usage example demonstrating the problems with poor abstraction
try {
  console.log("Creating media player without proper abstraction:");

  // Client needs to know what type of file it is dealing with
  const player = new MediaPlayer('music/song.mp3');

  // Client needs to call the correct play method based on file type
  console.log("\nPlaying an audio file:");
  player.playAudio(); // Must know to call playAudio() instead of a generic play()

  // Client needs to understand internal state
  console.log(`\nCurrent decoder state: ${player.decoderState}`);
  console.log(`Buffer size: ${player.bufferSize}`);
  console.log(`Audio codec: ${player.audioCodec}`);

  // Pause and resume
  player.pause();

  // Client needs to know the correct sequence of operations
  console.log("\nResuming playback:");
  player.startAudioPlayback(); // Must manually restart playback
  player.isPlaying = true; // Must manually update playing state

  // Stop playback
  player.stop();

  // Now try with a video file
  console.log("\nCreating a new player for video:");
  const videoPlayer = new MediaPlayer('videos/movie.mp4');

  console.log("\nPlaying a video file:");
  // Complex sequence of operations that client must know
  videoPlayer.playVideo();

  // Client can directly modify internal state, potentially breaking the player
  console.log("\nDirectly modifying internal state (problematic):");
  videoPlayer.frameRate = 60;
  videoPlayer.bufferSize = 4096;
  videoPlayer.streamSynchronized = false; // This will cause problems

  // This will throw an error because we broke the internal state
  console.log("\nTrying to pause after breaking internal state:");
  try {
    videoPlayer.pause();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

} catch (error) {
  console.error(`Error: ${error.message}`);
}

/**
 * This violates Abstraction because:
 *
 * 1. Implementation Details Exposed:
 *    - Internal details like buffers, codecs, and decoder states are publicly accessible
 *    - Clients need to understand these implementation details to use the class correctly
 *
 * 2. No Clear Interface:
 *    - Different methods for different media types (playAudio vs. playVideo)
 *    - No unified interface that hides the differences between media types
 *
 * 3. Client Burden:
 *    - Clients must know the correct sequence of method calls
 *    - Clients must handle low-level details like buffer allocation and stream synchronization
 *    - Clients can directly modify internal state, potentially breaking the object
 *
 * 4. Problems Demonstrated:
 *    - Complexity: Client code becomes complex and tightly coupled to implementation
 *    - Fragility: Changes to implementation will break client code
 *    - Maintenance: Hard to modify the implementation without affecting clients
 *    - Reusability: Difficult to reuse in different contexts due to tight coupling
 */