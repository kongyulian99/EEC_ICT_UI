import { Component, OnInit } from '@angular/core';
import { TopicInfo, TopicsService } from 'src/app/shared/services/topics.service';

@Component({
  selector: 'app-topic-training',
  templateUrl: './topic-training.component.html',
  styleUrls: ['./topic-training.component.scss']
})
export class TopicTrainingComponent implements OnInit {
  topics: TopicInfo[] = [];
  parentTopics: TopicInfo[] = [];
  childrenByParent: { [parentId: number]: TopicInfo[] } = {};

  constructor(
    private topicsService: TopicsService
  ) { }

  ngOnInit(): void {
    this.topicsService.getAllTopics().subscribe((res) => {
      if (res.ReturnStatus.Code === 1) {
        this.topics = res.ReturnData || [];
        this.buildHierarchy();
      }
    });
  }

  private buildHierarchy(): void {
    this.parentTopics = this.topics.filter(t => t.Parent_Id === null);
    this.childrenByParent = {};
    for (const topic of this.topics) {
      if (topic.Parent_Id !== null && topic.Parent_Id !== undefined) {
        const pid = topic.Parent_Id;
        if (!this.childrenByParent[pid]) {
          this.childrenByParent[pid] = [];
        }
        this.childrenByParent[pid].push(topic);
      }
    }

    // Optional: sort parents and children by Name or Id
    this.parentTopics.sort((a, b) => a.Id - b.Id);
    Object.keys(this.childrenByParent).forEach(key => {
      this.childrenByParent[+key].sort((a, b) => a.Id - b.Id);
    });
  }
}
