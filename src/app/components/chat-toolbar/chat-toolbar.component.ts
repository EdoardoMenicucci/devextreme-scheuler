import { Component, EventEmitter, Output } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-chat-toolbar',
  standalone: true,
  imports: [DxButtonModule],
  template: `
    <div class="chat-toolbar flex gap-2 p-2 bg-gray-100 border-b">
      <dx-button
        icon="trash"
        text="Clear Chat"
        [stylingMode]="'text'"
        (onClick)="clearChat.emit()"
      >
      </dx-button>
      <dx-button
        icon="download"
        text="Load Previous Messages"
        [stylingMode]="'text'"
        (onClick)="loadPrevious.emit()"
      >
      </dx-button>
    </div>
  `,
  styles: [
    `
    .chat-toolbar {
      min-height: 48px;
    }
    `
  ]
})
export class ChatToolbarComponent {
  @Output() clearChat = new EventEmitter<void>();
  @Output() loadPrevious = new EventEmitter<void>();
}
