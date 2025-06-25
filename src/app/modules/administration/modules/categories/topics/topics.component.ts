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
  placeholderSearch = 'Enter topic name...';
  title = 'Topic List';
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
  namePattern = /^.{3,300}$/;
  namePatternMessage = 'Topic name must be 3-300 characters';

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

    // Call API to get topic list
    this.topicsService.getAllTopics().subscribe(
      (response: ResponseData) => {
        if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
          this.treeData = response.ReturnData || [];

          // Filter by search keyword if any
          if (this.textSearch) {
            this.treeData = this.treeData.filter(item =>
              item.Name.toLowerCase().includes(this.textSearch.toLowerCase()) ||
              (item.Description && item.Description.toLowerCase().includes(this.textSearch.toLowerCase()))
            );
          }

          // Number hierarchical levels
          this.assignHierarchicalIndex();

          this.updateParentTopicsList();

          if (this.treeData.length > 0) {
            this.focusKey = this.treeData[0].Id;
            this.currentEntity = clone(this.treeData[0]);
          } else {
            this.focusKey = 0;
            this.currentEntity = {};
          }
        } else {
          this.notificationService.showError('Unable to load topic data');
        }
        this.loading = false;
      },
      error => {
        this.notificationService.showError('Error loading data: ' + error);
        this.loading = false;
      }
    );
  }

  // Function to number hierarchical levels for treeData
  assignHierarchicalIndex() {
    const map = new Map<number, any>();
    this.treeData.forEach(item => map.set(item.Id, item));
    // Build tree
    const roots = this.treeData.filter(item => !item.Parent_Id);
    let index = 1;
    roots.forEach(root => {
      root.DisplayIndex = `${index}`;
      this.assignChildIndex(root, map, root.DisplayIndex);
      index++;
    });
  }

  assignChildIndex(parent: any, map: Map<number, any>, prefix: string) {
    const children = this.treeData.filter(item => item.Parent_Id === parent.Id);
    children.forEach((child, idx) => {
      child.DisplayIndex = `${prefix}.${idx + 1}`;
      this.assignChildIndex(child, map, child.DisplayIndex);
    });
  }

  updateParentTopicsList() {
    // Update parent topic list (to display in dropdown)
    this.parentTopics = [
      { Id: null, Name: '-- Root Topic --' },
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
    // Don't allow selecting itself as parent
    if (parentId === topicId) {
      this.notificationService.showError('Cannot select this topic as its own parent!');
      return false;
    }

    // Don't allow selecting its child as parent (avoid circular reference)
    if (parentId !== null) {
      const childrenIds = this.getChildrenIds(topicId);
      if (childrenIds.includes(parentId)) {
        this.notificationService.showError('Cannot select child topic as parent (will create circular reference)!');
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
      this.notificationService.showError('Topic name cannot be empty!');
      return;
    }

    if (!this.namePattern.test(this.currentEntity.Name)) {
      this.notificationService.showError(this.namePatternMessage);
      return;
    }

    // Check for duplicate names (except itself when editing)
    const existingName = this.treeData.find(item =>
      item.Name.toLowerCase() === this.currentEntity.Name.toLowerCase() &&
      item.Id !== this.currentEntity.Id
    );

    if (existingName) {
      this.notificationService.showError('Topic name already exists!');
      return;
    }

    // Check valid Parent_Id
    if (this.currentEntity.Id > 0 && !this.validateParentId(this.currentEntity.Id, this.currentEntity.Parent_Id)) {
      return;
    }

    if (this.state === 'insert') {
      // Add new
      this.topicsService.createTopic(this.currentEntity).subscribe(
        (response: ResponseData) => {
          if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Topic added successfully!');
            this.loadData();
            // Get new ID from response
            if (response.ReturnData && response.ReturnData.New_Topic_Id) {
              this.focusKey = response.ReturnData.New_Topic_Id;
            }
          } else {
            this.notificationService.showError(response.ReturnStatus?.Message || 'Add failed!');
          }
        },
        error => {
          this.notificationService.showError('Error adding: ' + error);
        }
      );
    } else {
      // Update
      this.topicsService.updateTopic(this.currentEntity).subscribe(
        (response: ResponseData) => {
          if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Topic updated successfully!');
            this.loadData();
          } else {
            this.notificationService.showError(response.ReturnStatus?.Message || 'Update failed!');
          }
        },
        error => {
          this.notificationService.showError('Error updating: ' + error);
        }
      );
    }

    this.state = 'detail';
  }

  delete(id: number, name: string) {
    // Check if has child topics
    const hasChildren = this.treeData.some(item => item.Parent_Id === id);

    if (hasChildren) {
      this.notificationService.showConfirmation(
        `Topic '${name}' has child topics. When deleted, these child topics will become root topics. Are you sure you want to delete?`,
        () => this.performDelete(id, name)
      );
    } else {
      this.notificationService.showConfirmation(
        `Are you sure you want to delete topic '${name}'?`,
        () => this.performDelete(id, name)
      );
    }
  }

  performDelete(id: number, name: string) {
    this.topicsService.deleteTopic(id).subscribe(
      (response: ResponseData) => {
        if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
          this.notificationService.showSuccess(`Deleted topic '${name}' successfully!`);
          this.loadData();
        } else {
          this.notificationService.showError(response.ReturnStatus?.Message || 'Delete failed!');
        }
      },
      error => {
        this.notificationService.showError('Error deleting: ' + error);
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
