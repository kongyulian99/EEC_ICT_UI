import { Component, OnInit } from '@angular/core';
import { UserExamAttemptService } from 'src/app/shared/services/user-attempt.service';
import { UserExamHistoryItem, UserExamHistoryRequest, ScoreProgressRequest, ScoreDistributionRequest, ScoreRange } from 'src/app/shared/interfaces/user-exam-attempt.interface';
import { NotificationService, SystemConstants, User } from 'src/app/shared';
import { Router } from '@angular/router';
import { TopicsService, TopicInfo } from 'src/app/shared/services/topics.service';
import { UserExamAnswerService, TopicPerformanceInfo } from 'src/app/shared/services/user-exam-answer.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // User information
  currentUser: User = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) || '{}');
  userId: number = 0;
  userAvatar: string = '';

  // Exam history data
  isLoading: boolean = false;
  examHistory: UserExamHistoryItem[] = [];
  historySummary: any = {
    TotalExams: 0,
    TotalAttempts: 0,
    TotalPassed: 0,
    AverageScore: 0
  };

  // Chart data
  isLoadingCharts: boolean = false;
  progressData: any[] = [];
  progressSummary: any = null;
  scoreDistribution: ScoreRange[] = [];
  distributionSummary: any = null;

  // Topic performance data
  isLoadingTopicData: boolean = false;
  topicPerformanceData: any[] = [];
  topics: TopicInfo[] = [];
  topicTreeData: any[] = [];
  topicPerformanceInfo: TopicPerformanceInfo[] = [];

  // DevExtreme radar chart data
  radarChartData: any[] = [];
  radarChartPalette = ['#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#70AD47'];

  // DevExtreme TreeMap data
  treeMapData: any[] = [];

  // Visualization options
  visualizationOptions = {
    argumentAxis: {
      discreteAxisDivisionMode: 'crossLabels',
      firstPointOnStartAngle: true
    },
    export: {
      enabled: false
    },
    series: [{
      type: 'line',
      name: 'Your Score',
      valueField: 'score',
      closed: true,
      width: 2,
      point: {
        size: 7
      }
    }, {
      type: 'line',
      name: 'Ideal Score',
      valueField: 'idealScore',
      closed: true,
      width: 1,
      point: {
        size: 4
      },
      dashStyle: 'dash'
    }],
    tooltip: {
      enabled: true,
      customizeTooltip: function(arg) {
        return {
          text: arg.seriesName + ': ' + arg.valueText + '/10'
        };
      }
    },
    legend: {
      visible: true,
      horizontalAlignment: 'center',
      verticalAlignment: 'bottom'
    }
  };

  // TreeMap options
  treeMapOptions = {
    title: {
      text: 'Topic Performance by Category',
      font: {
        size: 16,
        weight: 500
      }
    },
    tooltip: {
      enabled: true,
      format: {
        precision: 1
      },
      customizeTooltip: (arg: any) => {
        return {
          text: `${arg.node.data.name}: ${arg.node.data.value}/10`
        };
      }
    },
    colorizer: {
      type: 'gradient',
      palette: ['#FF5252', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'],
      colorizeGroups: false
    },
    interactWithGroup: true,
    layoutAlgorithm: 'squarified',
    maxDepth: 2,
    layoutDirection: 'leftTopRightBottom'
  };

  // Chart configuration
  progressTitle: string = 'Score progress over time';
  progressLegendVisible: boolean = true;
  progressLegendPosition: string = 'bottom';
  progressTooltipEnabled: boolean = true;
  progressExportEnabled: boolean = true;
  progressValueMax: number = 10;
  progressValueMin: number = 0;
  progressValueTickInterval: number = 1;
  progressValueAxisTitle: string = 'Score (10-point scale)';

  // Chart configuration
  distributionTitle: string = 'Score distribution';
  distributionLegendVisible: boolean = false;
  distributionTooltipEnabled: boolean = true;
  distributionExportEnabled: boolean = true;
  distributionSeriesName: string = 'Attempt count';
  distributionSeriesColor: string = '#20c997';
  distributionArgumentAxisTitle: string = 'Score range';
  distributionValueAxisTitle: string = 'Attempt count';

  // Topic performance chart configuration
  topicChartPalette = ['#FF5252', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'];

  // Selected view mode
  selectedViewMode: string = 'treemap'; // 'treemap' or 'radar'

  constructor(
    private userExamAttemptService: UserExamAttemptService,
    private notificationService: NotificationService,
    private router: Router,
    private topicsService: TopicsService,
    private userExamAnswerService: UserExamAnswerService
  ) {
    // Get user ID from login information and convert to number type
    this.userId = this.currentUser && this.currentUser.Id ? parseInt(this.currentUser.Id.toString(), 10) : 0;

    // Get avatar from user information if available
    this.userAvatar = this.getUserAvatar();
  }

  ngOnInit(): void {
    this.loadUserExamHistory();
    this.loadChartData();
    this.loadTopicPerformance();
  }

  // Get user avatar
  getUserAvatar(): string {
    if (this.currentUser) {
      // Access avatar property using dynamic object syntax
      const userObj: any = this.currentUser;
      return userObj.Avatar || '';
    }
    return '';
  }

  // Load user exam history
  loadUserExamHistory(): void {
    if (!this.userId) {
      this.notificationService.showError('User information not found. Please log in again.');
      return;
    }

    this.isLoading = true;

    // Create request to get exam history
    const request: UserExamHistoryRequest = {
      UserId: this.userId,
      LimitRecentAttempts: 10 // Limit to 10 most recent attempts
    };

    // Call API to get exam history
    this.userExamAttemptService.getUserExamHistory(request).subscribe({
      next: (response) => {
        if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
          // Save the returned results
          this.examHistory = response.ReturnData?.History || [];
          this.historySummary = response.ReturnData?.Summary || {
            TotalExams: 0,
            TotalAttempts: 0,
            TotalPassed: 0,
            AverageScore: 0
          };
        } else {
          this.notificationService.showError('Failed to get exam history: ' + (response?.ReturnStatus?.Message || 'Unknown error'));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error getting exam history:', error);
        this.notificationService.showError('Error getting exam history');
        this.isLoading = false;
      }
    });
  }

  // Load chart data
  loadChartData(): void {
    if (!this.userId) {
      return;
    }

    this.isLoadingCharts = true;

    // Load score distribution data
    this.loadScoreDistribution();
  }

  // Load score distribution data
  loadScoreDistribution(): void {
    const distributionRequest: ScoreDistributionRequest = {
      UserId: this.userId,
      NumRanges: 5,
      UsePercentage: false // Use 10-point scale instead of 100-point scale
    };

    this.userExamAttemptService.getScoreDistribution(distributionRequest).subscribe({
      next: (response) => {
        if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
          this.scoreDistribution = response.ReturnData?.Distribution || [];
          this.distributionSummary = response.ReturnData?.Summary || null;
        } else {
          console.error('Error getting score distribution:', response?.ReturnStatus?.Message || 'Unknown error');
        }
        this.isLoadingCharts = false;
      },
      error: (error) => {
        console.error('Error getting score distribution:', error);
        this.isLoadingCharts = false;
      }
    });
  }

  // Load topic performance data
  loadTopicPerformance(): void {
    if (!this.userId) {
      return;
    }

    this.isLoadingTopicData = true;

    // Sử dụng forkJoin để gọi cả hai API cùng lúc
    forkJoin({
      topics: this.topicsService.getAllTopics(),
      performance: this.userExamAnswerService.getLowestPerformingTopics(this.userId, 20)
    }).subscribe({
      next: (results) => {
        const topicsResponse = results.topics;
        const performanceResponse = results.performance;

        if (topicsResponse && topicsResponse.ReturnStatus && topicsResponse.ReturnStatus.Code === 1) {
          this.topics = topicsResponse.ReturnData || [];

          if (performanceResponse && performanceResponse.ReturnStatus && performanceResponse.ReturnStatus.Code === 1) {
            // Lưu dữ liệu hiệu suất topic
            this.topicPerformanceInfo = performanceResponse.ReturnData || [];

            // Chuyển đổi dữ liệu từ API sang định dạng cần thiết cho biểu đồ
            this.processTopicPerformanceData();

            // Tạo cấu trúc cây cho topic
            this.generateTopicTreeData();

            // Tạo dữ liệu cho biểu đồ radar
            this.generateRadarChartData();

            // Tạo dữ liệu cho biểu đồ TreeMap
            this.generateTreeMapData();
          } else {
            console.error('Error getting topic performance:', performanceResponse?.ReturnStatus?.Message || 'Unknown error');
            // Sử dụng dữ liệu mẫu nếu API không hoạt động
            this.generateMockTopicPerformanceData();
            this.generateTopicTreeData();
            this.generateRadarChartData();
            this.generateTreeMapData();
          }
        } else {
          console.error('Error getting topics:', topicsResponse?.ReturnStatus?.Message || 'Unknown error');
          // Sử dụng dữ liệu mẫu nếu API không hoạt động
          this.generateMockTopicPerformanceData();
          this.generateTopicTreeData();
          this.generateRadarChartData();
          this.generateTreeMapData();
        }

        this.isLoadingTopicData = false;
      },
      error: (error) => {
        console.error('Error loading topic data:', error);
        this.isLoadingTopicData = false;

        // Sử dụng dữ liệu mẫu nếu API không hoạt động
        this.generateMockTopicPerformanceData();
        this.generateTopicTreeData();
        this.generateRadarChartData();
        this.generateTreeMapData();
      }
    });
  }

  // Xử lý dữ liệu hiệu suất topic từ API
  processTopicPerformanceData(): void {
    // Chuyển đổi từ TopicPerformanceInfo sang định dạng cần thiết cho biểu đồ
    this.topicPerformanceData = this.topicPerformanceInfo.map(info => {
      // Tìm thông tin topic để lấy parent ID
      const topic = this.topics.find(t => t.Id === info.TopicId);

      // Phân tích tên topic để tìm phần số (ví dụ: "1.5. Use the language" -> "1.5")
      const topicPrefix = info.TopicName.split('.')[0] + '.' + (info.TopicName.split('.')[1] || '');
      const mainCategory = topicPrefix.split('.')[0]; // Lấy số chính (ví dụ: "1")

      // Chuyển đổi điểm từ phần trăm sang thang điểm 10
      const scoreOn10Scale = Math.min(Math.max((info.AverageScore / 100) * 10, 0), 10);

      return {
        topicId: info.TopicId,
        topicName: info.TopicName,
        shortName: info.TopicName.length > 30 ? info.TopicName.substring(0, 30) + '...' : info.TopicName,
        topicPrefix: topicPrefix,
        mainCategory: mainCategory,
        parentId: topic?.Parent_Id || null,
        avgScore: parseFloat(scoreOn10Scale.toFixed(1)),
        attempts: info.AnsweredQuestions,
        needsImprovement: scoreOn10Scale < 7,
        totalQuestions: info.TotalQuestions,
        // Sort value for chart (lower scores first)
        sortValue: 10 - scoreOn10Scale
      };
    });

    // Nếu không có thông tin parentId từ topics, tạo cấu trúc cây dựa trên mainCategory
    if (this.topicPerformanceData.every(t => t.parentId === null)) {
      // Tạo các nhóm chính dựa trên mainCategory
      const mainCategories = [...new Set(this.topicPerformanceData.map(t => t.mainCategory))];

      // Tạo các topic ảo làm node cha
      const virtualParents = mainCategories.map((category, index) => {
        return {
          topicId: -1000 - index, // ID âm để tránh trùng với ID thực
          topicName: `Category ${category}`,
          shortName: `Category ${category}`,
          topicPrefix: category,
          mainCategory: category,
          parentId: null,
          avgScore: 0, // Sẽ tính trung bình sau
          attempts: 0,
          needsImprovement: false,
          totalQuestions: 0,
          sortValue: 0,
          isVirtual: true
        };
      });

      // Gán parentId cho các topic dựa trên mainCategory
      this.topicPerformanceData.forEach(topic => {
        const parentCategory = virtualParents.find(p => p.mainCategory === topic.mainCategory);
        if (parentCategory) {
          topic.parentId = parentCategory.topicId;
        }
      });

      // Thêm các node cha ảo vào danh sách
      this.topicPerformanceData = [...virtualParents, ...this.topicPerformanceData];

      // Tính điểm trung bình cho các node cha
      virtualParents.forEach(parent => {
        const children = this.topicPerformanceData.filter(t => t.parentId === parent.topicId);
        if (children.length > 0) {
          const avgScore = children.reduce((sum, child) => sum + child.avgScore, 0) / children.length;
          parent.avgScore = parseFloat(avgScore.toFixed(1));
          parent.totalQuestions = children.reduce((sum, child) => sum + child.totalQuestions, 0);
          parent.attempts = children.reduce((sum, child) => sum + child.attempts, 0);
          parent.needsImprovement = avgScore < 7;
          parent.sortValue = 10 - avgScore;
        }
      });
    }

    // Sort by score (lowest first)
    this.topicPerformanceData.sort((a, b) => a.sortValue - b.sortValue);
  }

  // Generate mock topic performance data for demonstration
  generateMockTopicPerformanceData(): void {
    // If we don't have real topics, create some mock topics with parent-child relationships
    if (!this.topics || this.topics.length === 0) {
      this.topics = [
        // Parent categories
        { Id: 1, Name: 'Mathematics', Description: 'Math topics', Parent_Id: null, Created_At: new Date(), Updated_At: new Date() },
        { Id: 2, Name: 'Science', Description: 'Science topics', Parent_Id: null, Created_At: new Date(), Updated_At: new Date() },
        { Id: 3, Name: 'Languages', Description: 'Language topics', Parent_Id: null, Created_At: new Date(), Updated_At: new Date() },
        { Id: 4, Name: 'Social Studies', Description: 'Social studies topics', Parent_Id: null, Created_At: new Date(), Updated_At: new Date() },

        // Math subtopics
        { Id: 101, Name: 'Algebra', Description: 'Algebra topics', Parent_Id: 1, Created_At: new Date(), Updated_At: new Date() },
        { Id: 102, Name: 'Geometry', Description: 'Geometry topics', Parent_Id: 1, Created_At: new Date(), Updated_At: new Date() },
        { Id: 103, Name: 'Calculus', Description: 'Calculus topics', Parent_Id: 1, Created_At: new Date(), Updated_At: new Date() },
        { Id: 104, Name: 'Statistics', Description: 'Statistics topics', Parent_Id: 1, Created_At: new Date(), Updated_At: new Date() },

        // Science subtopics
        { Id: 201, Name: 'Physics', Description: 'Physics topics', Parent_Id: 2, Created_At: new Date(), Updated_At: new Date() },
        { Id: 202, Name: 'Chemistry', Description: 'Chemistry topics', Parent_Id: 2, Created_At: new Date(), Updated_At: new Date() },
        { Id: 203, Name: 'Biology', Description: 'Biology topics', Parent_Id: 2, Created_At: new Date(), Updated_At: new Date() },
        { Id: 204, Name: 'Earth Science', Description: 'Earth Science topics', Parent_Id: 2, Created_At: new Date(), Updated_At: new Date() },

        // Language subtopics
        { Id: 301, Name: 'English', Description: 'English topics', Parent_Id: 3, Created_At: new Date(), Updated_At: new Date() },
        { Id: 302, Name: 'French', Description: 'French topics', Parent_Id: 3, Created_At: new Date(), Updated_At: new Date() },
        { Id: 303, Name: 'Spanish', Description: 'Spanish topics', Parent_Id: 3, Created_At: new Date(), Updated_At: new Date() },
        { Id: 304, Name: 'Chinese', Description: 'Chinese topics', Parent_Id: 3, Created_At: new Date(), Updated_At: new Date() },

        // Social Studies subtopics
        { Id: 401, Name: 'History', Description: 'History topics', Parent_Id: 4, Created_At: new Date(), Updated_At: new Date() },
        { Id: 402, Name: 'Geography', Description: 'Geography topics', Parent_Id: 4, Created_At: new Date(), Updated_At: new Date() },
        { Id: 403, Name: 'Economics', Description: 'Economics topics', Parent_Id: 4, Created_At: new Date(), Updated_At: new Date() },
        { Id: 404, Name: 'Political Science', Description: 'Political Science topics', Parent_Id: 4, Created_At: new Date(), Updated_At: new Date() }
      ];
    }

    // Generate performance data for each topic
    this.topicPerformanceData = this.topics.map(topic => {
      const score = Math.random() * 10;
      const avgScore = Math.min(Math.max(score, 3), 9); // Between 3 and 9
      const needsImprovement = avgScore < 7;

      return {
        topicId: topic.Id,
        topicName: topic.Name,
        parentId: topic.Parent_Id,
        avgScore: parseFloat(avgScore.toFixed(1)),
        attempts: Math.floor(Math.random() * 10) + 1,
        needsImprovement: needsImprovement,
        totalQuestions: Math.floor(Math.random() * 20) + 5,
        // Sort value for chart (lower scores first)
        sortValue: 10 - avgScore
      };
    });

    // Sort by score (lowest first)
    this.topicPerformanceData.sort((a, b) => a.sortValue - b.sortValue);
  }

  // Generate hierarchical topic tree data
  generateTopicTreeData(): void {
    // First, group topics by parent
    const topicsByParent = new Map();

    // Initialize with root topics (null parent)
    topicsByParent.set(null, []);

    // Group topics by parent ID
    this.topicPerformanceData.forEach(topic => {
      if (!topicsByParent.has(topic.parentId)) {
        topicsByParent.set(topic.parentId, []);
      }
      topicsByParent.get(topic.parentId).push(topic);
    });

    // Build tree starting from root topics
    this.topicTreeData = this.buildTopicTree(null, topicsByParent);
  }

  // Recursively build topic tree
  buildTopicTree(parentId: number | null, topicsByParent: Map<number | null, any[]>): any[] {
    const children = topicsByParent.get(parentId) || [];

    return children.map(topic => {
      const childTopics = this.buildTopicTree(topic.topicId, topicsByParent);

      return {
        ...topic,
        children: childTopics,
        hasChildren: childTopics.length > 0
      };
    });
  }

  // Generate radar chart data for DevExtreme
  generateRadarChartData(): void {
    if (!this.topicPerformanceData || this.topicPerformanceData.length === 0) {
      return;
    }

    // Only use leaf topics (those without children) for radar chart
    const leafTopics = this.topicPerformanceData.filter(topic =>
      !this.topicPerformanceData.some(t => t.parentId === topic.topicId) &&
      !topic.isVirtual // Exclude virtual parent nodes
    );

    // Prepare data for radar chart
    this.radarChartData = leafTopics.map(item => {
      return {
        topic: item.shortName || item.topicName, // Use shortName if available
        score: item.avgScore,
        idealScore: 10 // Ideal score is 10 for all topics
      };
    });
  }

  // Generate TreeMap data
  generateTreeMapData(): void {
    if (!this.topicTreeData || this.topicTreeData.length === 0) {
      return;
    }

    // Convert topic tree to treemap format
    this.treeMapData = this.convertToTreeMapFormat(this.topicTreeData);
  }

  // Convert topic tree to treemap format
  convertToTreeMapFormat(topics: any[]): any[] {
    return topics.map(topic => {
      const result: any = {
        name: topic.topicName,
        value: topic.avgScore,
        color: this.getTopicPerformanceColor(topic.avgScore)
      };

      if (topic.children && topic.children.length > 0) {
        result.items = this.convertToTreeMapFormat(topic.children);
      }

      return result;
    });
  }

  // Change view mode
  changeViewMode(mode: string): void {
    this.selectedViewMode = mode;
  }

  // Customize point tooltip
  customizeTooltip(arg: any) {
    return {
      text: `${arg.seriesName}: ${arg.valueText}/10`
    };
  }

  // Get topics that need improvement (score < 7)
  getTopicsNeedingImprovement(): any[] {
    if (!this.topicPerformanceData) return [];

    // Only get leaf topics (those without children)
    const leafTopics = this.topicPerformanceData.filter(topic =>
      !this.topicPerformanceData.some(t => t.parentId === topic.topicId)
    );

    return leafTopics
      .filter(topic => topic.avgScore < 7)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5); // Show top 5 topics that need most improvement
  }

  // Get color for topic performance bar
  getTopicPerformanceColor(score: number): string {
    if (score < 5) return this.topicChartPalette[0]; // Red
    if (score < 6) return this.topicChartPalette[1]; // Orange
    if (score < 7) return this.topicChartPalette[2]; // Yellow
    if (score < 8) return this.topicChartPalette[3]; // Light green
    return this.topicChartPalette[4]; // Green
  }

  // Get width percentage for topic performance bar
  getTopicPerformanceWidth(score: number): number {
    return (score / 10) * 100;
  }

  // Calculate percentage height of bar chart based on value and data
  getBarHeight(count: number, data: ScoreRange[]): number {
    if (!data || data.length === 0) return 0;

    // Find the maximum value in the data
    const maxCount = Math.max(...data.map(item => item.Count || 0));

    // Calculate percentage height
    return maxCount > 0 ? (count / maxCount) * 100 : 0;
  }

  // Navigate to topic detail or practice
  goToTopicPractice(topicId: number): void {
    // In a real application, navigate to a page where the student can practice this topic
    this.router.navigate(['/student/test'], {
      queryParams: { topicId: topicId }
    });
  }

  // View attempt details
  viewAttemptDetail(attempt: UserExamHistoryItem): void {
    if (!attempt || !attempt.ExamId) {
      this.notificationService.showError('Cannot view exam details.');
      return;
    }

    this.router.navigate(['/student/score-detail', attempt.ExamId, attempt.AttemptId], {
      queryParams: {
        attemptId: attempt.AttemptId,
        attemptNumber: attempt.AttemptNumber
      }
    });
  }

  // Start a new exam
  startNewExam(examId: number): void {
    if (!examId) {
      this.notificationService.showError('Invalid exam ID.');
      return;
    }

    this.router.navigate(['/student/test'], {
      queryParams: { id: examId }
    });
  }

  // Navigate to exam list page
  goToExams(): void {
    this.router.navigate(['/student/test']);
  }

  // Format date and time
  formatDate(date: Date | string): string {
    if (!date) return '';

    try {
      return new Date(date).toLocaleString('en-US'); // Changed to en-US locale
    } catch (error) {
      return '';
    }
  }
}
