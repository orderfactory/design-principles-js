/**
 * Abstraction Principle - Correct Implementation
 *
 * Abstraction is the concept of hiding complex implementation details and exposing only
 * the necessary parts of an object. It allows us to model real-world entities by focusing
 * on what an object does rather than how it does it.
 *
 * Benefits of abstraction:
 * 1. Simplicity: Users of the abstraction don't need to understand the complex details
 * 2. Maintainability: Implementation can change without affecting the interface
 * 3. Reusability: Well-designed abstractions can be reused in different contexts
 * 4. Reduced complexity: Focusing on essential features makes code easier to understand
 *
 * In this example, we create a MediaPlayer abstraction that hides the complex details
 * of playing different types of media files.
 */

// Abstract base class for media players
class MediaPlayer {
  constructor(mediaFile) {
    this.mediaFile = mediaFile;
    this.isPlaying = false;
    this.currentPosition = 0;

    // Ensure this class is not instantiated directly
    if (this.constructor === MediaPlayer) {
      throw new Error("MediaPlayer is an abstract class and cannot be instantiated directly");
    }
  }

  // Abstract methods that subclasses must implement
  play() {
    throw new Error("Method 'play()' must be implemented by subclasses");
  }

  pause() {
    throw new Error("Method 'pause()' must be implemented by subclasses");
  }

  stop() {
    throw new Error("Method 'stop()' must be implemented by subclasses");
  }

  // Common functionality for all media players
  getPosition() {
    return this.currentPosition;
  }

  getFileName() {
    return this.mediaFile.split('/').pop();
  }

  getFileExtension() {
    return this.mediaFile.split('.').pop().toLowerCase();
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }
}

// Concrete implementation for audio files
class AudioPlayer extends MediaPlayer {
  constructor(audioFile) {
    super(audioFile);
    this.volume = 70; // Default volume (0-100)
    this.equalizer = {
      bass: 50,
      mid: 50,
      treble: 50
    };

    console.log(`AudioPlayer initialized for file: ${this.getFileName()}`);
  }

  play() {
    // Complex implementation details hidden from the user
    this._initializeAudioCodec();
    this._loadAudioBuffer();
    this._processAudioStream();

    this.isPlaying = true;
    console.log(`Playing audio: ${this.getFileName()}`);
  }

  pause() {
    this.isPlaying = false;
    console.log(`Paused audio: ${this.getFileName()}`);
  }

  stop() {
    this.isPlaying = false;
    this.currentPosition = 0;
    console.log(`Stopped audio: ${this.getFileName()}`);
  }

  setVolume(level) {
    if (level < 0 || level > 100) {
      throw new Error("Volume must be between 0 and 100");
    }
    this.volume = level;
    console.log(`Volume set to ${level}%`);
  }

  adjustEqualizer(bass, mid, treble) {
    this.equalizer = { bass, mid, treble };
    console.log(`Equalizer adjusted: Bass=${bass}, Mid=${mid}, Treble=${treble}`);
  }

  // Private implementation details (would use # in production code)
  _initializeAudioCodec() {
    // Complex codec initialization logic
    const codec = this.getFileExtension() === 'mp3' ? 'MP3' :
                 this.getFileExtension() === 'wav' ? 'WAV' : 'AAC';
    console.log(`[Internal] Initializing ${codec} codec`);
  }

  _loadAudioBuffer() {
    // Complex buffer loading logic
    console.log(`[Internal] Loading audio buffer`);
  }

  _processAudioStream() {
    // Complex audio processing logic
    console.log(`[Internal] Processing audio stream with equalizer settings`);
  }
}

// Concrete implementation for video files
class VideoPlayer extends MediaPlayer {
  constructor(videoFile) {
    super(videoFile);
    this.volume = 70; // Default volume (0-100)
    this.resolution = "1080p"; // Default resolution
    this.subtitlesEnabled = false;

    console.log(`VideoPlayer initialized for file: ${this.getFileName()}`);
  }

  play() {
    // Complex implementation details hidden from the user
    this._initializeVideoCodec();
    this._setupVideoBuffer();
    this._synchronizeAudioVideo();

    this.isPlaying = true;
    console.log(`Playing video: ${this.getFileName()} at ${this.resolution}`);
  }

  pause() {
    this.isPlaying = false;
    console.log(`Paused video: ${this.getFileName()}`);
  }

  stop() {
    this.isPlaying = false;
    this.currentPosition = 0;
    console.log(`Stopped video: ${this.getFileName()}`);
  }

  setVolume(level) {
    if (level < 0 || level > 100) {
      throw new Error("Volume must be between 0 and 100");
    }
    this.volume = level;
    console.log(`Volume set to ${level}%`);
  }

  setResolution(resolution) {
    const validResolutions = ["480p", "720p", "1080p", "4K"];
    if (!validResolutions.includes(resolution)) {
      throw new Error(`Invalid resolution. Must be one of: ${validResolutions.join(', ')}`);
    }
    this.resolution = resolution;
    console.log(`Resolution set to ${resolution}`);
  }

  toggleSubtitles(enabled) {
    this.subtitlesEnabled = enabled;
    console.log(`Subtitles ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Private implementation details (would use # in production code)
  _initializeVideoCodec() {
    // Complex codec initialization logic
    const codec = this.getFileExtension() === 'mp4' ? 'H.264' :
                 this.getFileExtension() === 'avi' ? 'XVID' : 'VP9';
    console.log(`[Internal] Initializing ${codec} codec`);
  }

  _setupVideoBuffer() {
    // Complex buffer setup logic
    console.log(`[Internal] Setting up video buffer for ${this.resolution}`);
  }

  _synchronizeAudioVideo() {
    // Complex A/V sync logic
    console.log(`[Internal] Synchronizing audio and video streams`);
  }
}

// Media player factory - further abstraction that hides the decision of which player to create
class MediaPlayerFactory {
  static createPlayer(mediaFile) {
    const extension = mediaFile.split('.').pop().toLowerCase();

    // Audio file types
    if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) {
      return new AudioPlayer(mediaFile);
    }
    // Video file types
    else if (['mp4', 'avi', 'mkv', 'mov'].includes(extension)) {
      return new VideoPlayer(mediaFile);
    }
    else {
      throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}

// Usage example
try {
  console.log("Creating media players using the factory (abstraction):");

  // The client code works with the abstraction without worrying about the specific player type
  const audioPlayer = MediaPlayerFactory.createPlayer('music/song.mp3');
  const videoPlayer = MediaPlayerFactory.createPlayer('videos/movie.mp4');

  console.log("\nUsing the audio player:");
  audioPlayer.play();
  audioPlayer.setVolume(80);
  audioPlayer.pause();
  audioPlayer.play();
  audioPlayer.stop();

  console.log("\nUsing the video player:");
  videoPlayer.play();
  videoPlayer.setResolution("4K");
  videoPlayer.toggleSubtitles(true);
  videoPlayer.pause();
  videoPlayer.play();
  videoPlayer.stop();

  // Try to instantiate the abstract class directly
  console.log("\nTrying to instantiate the abstract class:");
  const abstractPlayer = new MediaPlayer('file.mp3');

} catch (error) {
  console.error(`Error: ${error.message}`);
}

/**
 * This demonstrates proper Abstraction because:
 *
 * 1. Implementation Hiding:
 *    - The complex details of how media is played are hidden inside the concrete classes
 *    - Private methods (prefixed with _) handle the internal implementation
 *    - Users only interact with simple, high-level methods like play(), pause(), stop()
 *
 * 2. Interface Focus:
 *    - The MediaPlayer abstract class defines a clear interface
 *    - Users work with the abstraction rather than concrete implementations
 *
 * 3. Separation of Concerns:
 *    - The MediaPlayerFactory further abstracts the creation process
 *    - Clients don't need to know which concrete class to instantiate
 *
 * 4. Benefits Demonstrated:
 *    - Simplicity: Client code is simple and focused on what to do, not how
 *    - Maintainability: Implementation details can change without affecting client code
 *    - Extensibility: New media types can be added by creating new subclasses
 */