import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CutInList } from '@udonarium/cut-in-list';
import { CutIn } from '@udonarium/cut-in';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { PointerDeviceService } from 'service/pointer-device.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';
import { SaveDataService } from 'service/save-data.service';
import { EventSystem } from '@udonarium/core/system';
import { HelpComponent } from 'component/help/help.component';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { CutInService } from 'service/cut-in.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { UUID } from '@udonarium/core/system/util/uuid';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { CutInComponent } from 'component/cut-in/cut-in.component';


@Component({
  selector: 'app-cut-in-setting',
  templateUrl: './cut-in-setting.component.html',
  styleUrls: ['./cut-in-setting.component.css']
})
export class CutInSettingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cutInSelecter') cutInSelecter: ElementRef<HTMLSelectElement>;
  readonly minSize: number = 0;
  readonly maxSize: number = 100;

  panelId: string;

  isShowHideImages = false;
  selectedCutIn: CutIn = null;
  selectedCutInXml: string = '';

  get cutIns(): CutIn[] { return CutInList.instance.cutIns; }

  get cutInName(): string { return this.selectedCutIn.name; }
  set cutInName(cutInName: string) { if (this.isEditable) this.selectedCutIn.name = cutInName; }

  get cutInTag(): string { return this.selectedCutIn.tag; }
  set cutInTag(cutInTag: string) { if (this.isEditable) this.selectedCutIn.tag = cutInTag; }

  get cutInDuration(): number { return this.selectedCutIn.duration; }
  set cutInDuration(cutInDuration: number) { if (this.isEditable) this.selectedCutIn.duration = cutInDuration; }

  get cutInCond(): string { return this.selectedCutIn.value + ''; }
  set cutInCond(cutInCond: string) { if (this.isEditable) this.selectedCutIn.value = cutInCond; }

  get cutInIsPreventOutBounds(): boolean { return this.selectedCutIn.isPreventOutBounds; }
  set cutInIsPreventOutBounds(isPreventOutBounds: boolean) { if (this.isEditable) this.selectedCutIn.isPreventOutBounds = isPreventOutBounds; }

  get cutInWidth(): number { return this.selectedCutIn.width; }
  set cutInWidth(cutInWidth: number) { if (this.isEditable) this.selectedCutIn.width = cutInWidth; }

  get cutInHeight(): number { return this.selectedCutIn.height; }
  set cutInHeight(cutInHeight: number) { if (this.isEditable) this.selectedCutIn.height = cutInHeight; }

  get objectFitType(): number { return this.selectedCutIn.objectFitType; }
  set objectFitType(objectFitType: number) { if (this.isEditable) this.selectedCutIn.objectFitType = objectFitType; }

  get cutInPosX(): number { return this.selectedCutIn.posX; }
  set cutInPosX(cutInPosX: number) { if (this.isEditable) this.selectedCutIn.posX = cutInPosX; }

  get cutInPosY(): number { return this.selectedCutIn.posY; }
  set cutInPosY(cutInPosY: number) { if (this.isEditable) this.selectedCutIn.posY = cutInPosY; }

  get cutInZIndex(): number { return this.selectedCutIn.zIndex; }
  set cutInZIndex(cutInZIndex: number) { if (this.isEditable) this.selectedCutIn.zIndex = cutInZIndex; }

  get cutInIsFrontOfStand(): boolean { return this.selectedCutIn.isFrontOfStand; }
  set cutInIsFrontOfStand(isFrontOfStand: boolean) { if (this.isEditable) this.selectedCutIn.isFrontOfStand = isFrontOfStand; }

  get cutInAudioIdentifier(): string { return this.selectedCutIn.audioIdentifier; }
  set cutInAudioIdentifier(audioIdentifier: string) { if (this.isEditable) this.selectedCutIn.audioIdentifier = audioIdentifier; }
  
  get cutInAudioFileName(): string { return this.selectedCutIn.audioFileName; }
  set cutInAudioFileName(audioFileName: string) { if (this.isEditable) this.selectedCutIn.audioFileName = audioFileName; }

  get cutInSEIsLoop(): boolean { return this.selectedCutIn.isLoop; }
  set cutInSEIsLoop(isLoop: boolean) { if (this.isEditable) this.selectedCutIn.isLoop = isLoop; }

  get cutInType(): number { return this.selectedCutIn.animationType; }
  set cutInType(cutInType: number) { if (this.isEditable) this.selectedCutIn.animationType = cutInType; }

  get borderStyle(): number { return this.selectedCutIn.borderStyle; }
  set borderStyle(borderStyle: number) { if (this.isEditable) this.selectedCutIn.borderStyle = borderStyle; }

  get isEmpty(): boolean { return this.cutIns.length < 1; }
  get isDeleted(): boolean { return this.selectedCutIn ? ObjectStore.instance.get(this.selectedCutIn.identifier) == null : false; }
  get isEditable(): boolean { return !this.isEmpty && !this.isDeleted; }

  get cutInIsVideo(): boolean { return this.selectedCutIn.isVideoCutIn; }
  set cutInIsVideo(isVideo: boolean) { if (this.isEditable) this.selectedCutIn.isVideoCutIn = isVideo; }

  get cutInVideoURL(): string { return this.selectedCutIn.videoUrl; }
  set cutInVideoURL(videoUrl: string) { if (this.isEditable) this.selectedCutIn.videoUrl = videoUrl; }

  get cutInisSoundOnly(): boolean { return this.selectedCutIn.isSoundOnly; }
  set cutInisSoundOnly(isSoundOnly: boolean) { if (this.isEditable)  this.selectedCutIn.isSoundOnly = isSoundOnly; }

  get cutInVideoId(): string {
    if (!this.selectedCutIn) return '';
    return this.selectedCutIn.videoId;
  }

  get cutInPlayListId(): string {
    if (!this.cutInVideoId) return '';
    return this.selectedCutIn.playListId;
  }

  get cutInImage(): ImageFile {
    if (!this.selectedCutIn) return ImageFile.Empty;
    let file = ImageStorage.instance.get(this.selectedCutIn.imageIdentifier);
    return file ? file : ImageFile.Empty;
  }
  
  get cutInImageUrl(): string {
    if (!this.selectedCutIn) return ImageFile.Empty.url;
    return (!this.selectedCutIn.videoId || this.cutInisSoundOnly) ? this.cutInImage.url : `https://img.youtube.com/vi/${this.selectedCutIn.videoId}/hqdefault.jpg`;
  }

  get isPlaying(): boolean {
    if (!this.selectedCutIn) return false;
    return CutInService.nowShowingIdentifiers().includes(this.selectedCutIn.identifier);
  }

  isPlayingNow(cutIn: CutIn): boolean {
    if (!cutIn) return false;
    return CutInService.nowShowingIdentifiers().includes(cutIn.identifier);
  }

  get isValidAudio(): boolean {
    if (!this.selectedCutIn) return true;
    return this.selectedCutIn.isValidAudio;
  }
  
  get myPeer(): PeerCursor { return this.playerService.myPeer; }
  get otherPeers(): PeerCursor[] { return this.playerService.otherPeers; }

  get myColor(): string {
   return this.playerService.myColor;
  }

  get sendToColor(): string {
    let peer = this.playerService.findByPeerId(this.sendTo);
    if (peer){
      return peer.player.color;
    }
    return this.playerService.CHAT_BLACKTEXT_COLOR;
  }

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }

  sendTo: string = '';
  isSaveing: boolean = false;
  progresPercent: number = 0;

  constructor(
    private pointerDeviceService: PointerDeviceService,
    private modalService: ModalService,
    private panelService: PanelService,
    private playerService: PlayerService,
    public roomService: RoomService,
    private saveDataService: SaveDataService
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'カットイン設定');
    EventSystem.register(this)
      .on('SYNCHRONIZE_AUDIO_LIST', -1000, event => {
        this.onAudioFileChange();
      });
    this.panelId = UUID.generateUuid();
  }

  ngAfterViewInit() {
    if (this.cutIns.length > 0) {
      setTimeout(() => {
        this.onChangeCutIn(this.cutIns[0].identifier);
        this.cutInSelecter.nativeElement.selectedIndex = 0;
      });
    }
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  onChangeCutIn(identifier: string) {
    this.selectedCutIn = ObjectStore.instance.get<CutIn>(identifier);
    this.selectedCutInXml = '';
  }

  create(name: string = 'カットイン'): CutIn {
    return CutInList.instance.addCutIn(name)
  }

  add() {
    const cutIn = this.create();
    cutIn.imageIdentifier = 'stand_no_image';
    setTimeout(() => {
      this.onChangeCutIn(cutIn.identifier);
      this.cutInSelecter.nativeElement.value = cutIn.identifier;
    })
  }
  
  async save() {
    if (!this.selectedCutIn || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    let fileName: string = 'fly_cutIn_' + this.selectedCutIn.name;

    await this.saveDataService.saveGameObjectAsync(this.selectedCutIn, fileName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  delete() {
    if (!this.selectedCutIn) return;
    EventSystem.call('STOP_CUT_IN', { 
      identifier: this.selectedCutIn.identifier
    });
    if (!this.isEmpty) {
      this.selectedCutInXml = this.selectedCutIn.toXml();
      this.selectedCutIn.destroy();
    }
  }

  restore() {
    if (this.selectedCutIn && this.selectedCutInXml) {
      let restoreCutIn = <CutIn>ObjectSerializer.instance.parseXml(this.selectedCutInXml);
      CutInList.instance.addCutIn(restoreCutIn);
      this.selectedCutInXml = '';
      setTimeout(() => {
        const cutIns = this.cutIns;
        this.onChangeCutIn(cutIns[cutIns.length - 1].identifier);
        this.cutInSelecter.nativeElement.selectedIndex = cutIns.length - 1;
      });
    }
  }

  getHidden(image: ImageFile): boolean {
    return !( image.owner.includes(this.playerService.myPlayer.playerId) ); 
  }

  upTabIndex() {
    if (!this.selectedCutIn) return;
    let parentElement = this.selectedCutIn.parent;
    let index: number = parentElement.children.indexOf(this.selectedCutIn);
    if (0 < index) {
      let prevElement = parentElement.children[index - 1];
      parentElement.insertBefore(this.selectedCutIn, prevElement);
    }
  }

  downTabIndex() {
    if (!this.selectedCutIn) return;
    let parentElement = this.selectedCutIn.parent;
    let index: number = parentElement.children.indexOf(this.selectedCutIn);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.selectedCutIn);
    }
  }

  openModal() {
    if (this.isDeleted) return;
    let currentImageIdentifires: string[] = [];
    if (this.selectedCutIn && this.selectedCutIn.imageIdentifier) currentImageIdentifires = [this.selectedCutIn.imageIdentifier];
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!this.selectedCutIn || !value) return;
      this.selectedCutIn.imageIdentifier = value;
    });
  }

  onShowHiddenImages($event: Event) {
    if (this.isShowHideImages) {
      this.isShowHideImages = false;
    } else {
      if (window.confirm("非表示設定の画像を表示します（ネタバレなどにご注意ください）。\nよろしいですか？")) {
        this.isShowHideImages = true;
      } else {
        this.isShowHideImages = false;
        $event.preventDefault();
      }
    }
  }

  playCutIn() {
    if (!this.selectedCutIn) return;
    const sendObj = {
      identifier: this.selectedCutIn.identifier,
      secret: this.sendTo ? true : false,
      sender: PeerCursor.myCursor.peerId
    };
    if (sendObj.secret) {
      const targetPeer = this.playerService.findByPeerId(this.sendTo); 
      if (targetPeer) {
        if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('PLAY_CUT_IN', sendObj, targetPeer.peerId);
        EventSystem.call('PLAY_CUT_IN', sendObj, PeerCursor.myCursor.peerId);
      }
    } else {
      EventSystem.call('PLAY_CUT_IN', sendObj);
    }
  }

  stopCutIn() {
    if (!this.selectedCutIn) return;
    const sendObj = {
      identifier: this.selectedCutIn.identifier,
      secret: this.sendTo ? true : false,
      sender: PeerCursor.myCursor.peerId
    };
    if (sendObj.secret) {
      const targetPeer = this.playerService.findByPeerId(this.sendTo); 
      if (targetPeer) {
        if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('STOP_CUT_IN', sendObj, targetPeer.peerId);
        EventSystem.call('STOP_CUT_IN', sendObj, PeerCursor.myCursor.peerId);
      }
    } else {
      EventSystem.call('STOP_CUT_IN', sendObj);
    }
  }

  testCutIn() {
    if (!this.selectedCutIn) return;
    setTimeout(() => {
      EventSystem.trigger('PLAY_CUT_IN', { 
        identifier: this.selectedCutIn.identifier, 
        test: true
      });
    });
  }

  onAudioFileChange(identifier: string='') {
    if (!identifier && this.selectedCutIn) identifier = this.selectedCutIn.audioIdentifier;
    if (identifier == '') {
      this.cutInAudioFileName = '';
      return;
    }
    const audio = AudioStorage.instance.get(identifier);
    this.cutInAudioFileName = audio ? audio.name : '';
  }

  openYouTubeTerms() {
    this.modalService.open(OpenUrlComponent, { url: 'https://www.youtube.com/terms', title: 'YouTube 利用規約' });
    return false;
  }

  helpCutIn() {
    let option: PanelOption = { width: 800 , height: 600, left: 50, top: 100 };
    let component = this.panelService.open(HelpComponent,option);
    component.menu = "cutin";
  }
}
