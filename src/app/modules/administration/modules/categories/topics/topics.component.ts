import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { clone, NotificationService, SystemConstants } from 'src/app/shared';
import { dxButtonConfig, PaginatorConfig } from 'src/app/shared/config';
import { ResponseData } from 'src/app/shared/models';
import { TopicsService } from 'src/app/shared/services/topics.service';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {
  placeholderSearch = 'Nhập tên chủ đề...';
  title = 'Danh sách chủ đề';
  optionsBtnFilter = {
    icon: 'find',
    type: 'default',
    visible: true,
    onClick: this.onFilter.bind(this)
  }
  dxButtonConfig = dxButtonConfig;

  isShowDetail = false;
  focusKey: any = 0;

  state: string = 'detail';
  loading = false;

  textSearch: string = '';

  // Data
  treeData: any[] = [];
  currentEntity: any = {};
  parentTopics: any[] = [];

  // TreeList reference
  @ViewChild('treeList') treeList: any;

  // Form validation
  namePattern = /^.{3,100}$/;
  namePatternMessage = 'Tên chủ đề phải từ 3-100 ký tự';

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private topicsService: TopicsService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // Gọi API lấy danh sách chủ đề
    this.topicsService.getAllTopics().subscribe(
      (response: ResponseData) => {
        if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
          this.treeData = response.ReturnData || [];

          // Lọc theo từ khóa tìm kiếm nếu có
          if (this.textSearch) {
            this.treeData = this.treeData.filter(item =>
              item.Name.toLowerCase().includes(this.textSearch.toLowerCase()) ||
              (item.Description && item.Description.toLowerCase().includes(this.textSearch.toLowerCase()))
            );
          }

          this.updateParentTopicsList();

          if (this.treeData.length > 0) {
            this.focusKey = this.treeData[0].Id;
            this.currentEntity = clone(this.treeData[0]);
          } else {
            this.focusKey = 0;
            this.currentEntity = {};
          }
        } else {
          this.notificationService.showError('Không thể tải dữ liệu chủ đề');
        }
        this.loading = false;
      },
      error => {
        this.notificationService.showError('Lỗi khi tải dữ liệu: ' + error);
        this.loading = false;
      }
    );
  }

  updateParentTopicsList() {
    // Cập nhật danh sách chủ đề cha (để hiển thị trong dropdown)
    this.parentTopics = [
      { Id: null, Name: '-- Chủ đề gốc --' },
      ...this.treeData.map(item => ({ Id: item.Id, Name: item.Name }))
    ];
  }

  onFilter() {
    this.loadData();
  }

  expandAll() {
    const treeList = document.getElementById('treeListContainer');
    if (treeList) {
      const instance = (treeList as any).instance;
      if (instance && instance.expandAll) {
        instance.expandAll();
      }
    }
  }

  collapseAll() {
    const treeList = document.getElementById('treeListContainer');
    if (treeList) {
      const instance = (treeList as any).instance;
      if (instance && instance.collapseAll) {
        instance.collapseAll();
      }
    }
  }

  onRowClick(e: any) {
    this.currentEntity = clone(e.data);
    this.focusKey = e.data.Id;
    this.isShowDetail = true;
    this.state = 'detail';
  }

  add() {
    this.currentEntity = {
      Id: 0,
      Name: '',
      Description: '',
      Parent_Id: null,
      Created_At: new Date(),
      Updated_At: new Date()
    };
    this.state = 'insert';
    this.isShowDetail = true;
  }

  edit() {
    this.state = 'edit';
  }

  editRow = (e: any) => {
    this.currentEntity = clone(e.row.data);
    this.focusKey = e.row.data.Id;
    this.isShowDetail = true;
    this.state = 'edit';
    e.event.preventDefault();
  }

  deleteRow = (e: any) => {
    const id = e.row.data.Id;
    const name = e.row.data.Name;
    this.delete(id, name);
    e.event.preventDefault();
  }

  cancel() {
    if (this.state === 'insert') {
      this.isShowDetail = false;
    }

    if (this.focusKey && this.focusKey > 0) {
      const topic = this.treeData.find(x => x.Id == this.focusKey);
      if (topic) {
        this.currentEntity = clone(topic);
      }
    } else {
      this.currentEntity = {};
    }

    this.state = 'detail';
  }

  validateParentId(topicId: number, parentId: number | null): boolean {
    // Không cho phép chọn chính nó làm cha
    if (parentId === topicId) {
      this.notificationService.showError('Không thể chọn chính chủ đề này làm chủ đề cha!');
      return false;
    }

    // Không cho phép chọn con của nó làm cha (tránh tạo vòng lặp)
    if (parentId !== null) {
      const childrenIds = this.getChildrenIds(topicId);
      if (childrenIds.includes(parentId)) {
        this.notificationService.showError('Không thể chọn chủ đề con làm chủ đề cha (sẽ tạo vòng lặp)!');
        return false;
      }
    }

    return true;
  }

  getChildrenIds(topicId: number): number[] {
    const result: number[] = [];
    const directChildren = this.treeData.filter(item => item.Parent_Id === topicId);

    directChildren.forEach(child => {
      result.push(child.Id);
      result.push(...this.getChildrenIds(child.Id));
    });

    return result;
  }

  save() {
    if (!this.currentEntity.Name || this.currentEntity.Name.trim() === '') {
      this.notificationService.showError('Tên chủ đề không được để trống!');
      return;
    }

    if (!this.namePattern.test(this.currentEntity.Name)) {
      this.notificationService.showError(this.namePatternMessage);
      return;
    }

    // Kiểm tra trùng tên (trừ chính nó khi đang edit)
    const existingName = this.treeData.find(item =>
      item.Name.toLowerCase() === this.currentEntity.Name.toLowerCase() &&
      item.Id !== this.currentEntity.Id
    );

    if (existingName) {
      this.notificationService.showError('Tên chủ đề đã tồn tại!');
      return;
    }

    // Kiểm tra Parent_Id hợp lệ
    if (this.currentEntity.Id > 0 && !this.validateParentId(this.currentEntity.Id, this.currentEntity.Parent_Id)) {
      return;
    }

    if (this.state === 'insert') {
      // Thêm mới
      this.topicsService.createTopic(this.currentEntity).subscribe(
        (response: ResponseData) => {
          if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Thêm mới chủ đề thành công!');
            this.loadData();
            // Lấy ID mới được tạo từ response
            if (response.ReturnData && response.ReturnData.New_Topic_Id) {
              this.focusKey = response.ReturnData.New_Topic_Id;
            }
          } else {
            this.notificationService.showError(response.ReturnStatus?.Message || 'Thêm mới thất bại!');
          }
        },
        error => {
          this.notificationService.showError('Lỗi khi thêm mới: ' + error);
        }
      );
    } else {
      // Cập nhật
      this.topicsService.updateTopic(this.currentEntity).subscribe(
        (response: ResponseData) => {
          if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Cập nhật chủ đề thành công!');
            this.loadData();
          } else {
            this.notificationService.showError(response.ReturnStatus?.Message || 'Cập nhật thất bại!');
          }
        },
        error => {
          this.notificationService.showError('Lỗi khi cập nhật: ' + error);
        }
      );
    }

    this.state = 'detail';
  }

  delete(id: number, name: string) {
    // Kiểm tra xem có chủ đề con không
    const hasChildren = this.treeData.some(item => item.Parent_Id === id);

    if (hasChildren) {
      this.notificationService.showConfirmation(
        `Chủ đề '${name}' có chứa các chủ đề con. Khi xóa, các chủ đề con sẽ trở thành chủ đề gốc. Bạn có chắc chắn muốn xóa?`,
        () => this.performDelete(id, name)
      );
    } else {
      this.notificationService.showConfirmation(
        `Bạn có chắc chắn muốn xóa chủ đề '${name}'?`,
        () => this.performDelete(id, name)
      );
    }
  }

  performDelete(id: number, name: string) {
    this.topicsService.deleteTopic(id).subscribe(
      (response: ResponseData) => {
        if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
          this.notificationService.showSuccess(`Đã xóa thành công chủ đề '${name}'!`);
          this.loadData();
        } else {
          this.notificationService.showError(response.ReturnStatus?.Message || 'Xóa thất bại!');
        }
      },
      error => {
        this.notificationService.showError('Lỗi khi xóa: ' + error);
      }
    );
  }

  toggleDetail() {
    this.isShowDetail = !this.isShowDetail;
  }

  onFocusedRowChanged(e: any) {
    if (e.row && e.row.data) {
      this.currentEntity = clone(e.row.data);
      this.state = 'detail';
    }
  }
}
