import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-slideshow-image',
    templateUrl: './slideshow-image.component.html',
    styleUrls: ['./slideshow-image.component.scss']
})
export class SlideshowImagesComponent {
    // @Input() dataImages : any = [];
    @Input() width : any = 'auto';
    @Input() height : any = 'auto'
    // indexShow = 0;


    @Input() urlFolder = ''
    @Input() dataImages = [];
    currentIndex = 0;
    isOpen = false;

    // Mở popup
    openPopup() {
        this.isOpen = true;
        this.currentIndex = 0; // Đặt lại vị trí ảnh đầu tiên
    }

    // Đóng popup
    closePopup() {
        this.isOpen = false;
    }

    // Chuyển sang ảnh tiếp theo
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.dataImages.length;
    }

    // Quay lại ảnh trước
    prevImage() {
        this.currentIndex =
            (this.currentIndex - 1 + this.dataImages.length) % this.dataImages.length;
    }
}