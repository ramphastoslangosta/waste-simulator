# Task Planning Guide

This document explains how to use the `tasks.csv` file for planning development cycles and commits following the DEVELOPMENT_PROTOCOL.md workflow.

## 📋 CSV Structure

The `tasks.csv` file contains the following columns:

- **task_id**: Unique identifier for tracking (e.g., TASK-001)
- **title**: Brief, descriptive task name
- **description**: Detailed explanation of what needs to be accomplished
- **priority**: High/Medium/Low based on business impact and technical urgency
- **estimated_effort**: Time estimate in days for planning purposes
- **category**: Type of work (feature/enhancement/bugfix/docs)
- **branch_name**: Suggested branch name following naming conventions
- **dependencies**: Other tasks that must be completed first
- **success_criteria**: How to know when the task is complete
- **files_to_modify**: Key files that will likely need changes

## 🎯 How to Use for Commit Planning

### 1. Sprint Planning Process

```bash
# Filter tasks by priority for sprint planning
cat tasks.csv | grep "High" | head -5
```

**Recommended Sprint Composition:**
- 1-2 High priority tasks (critical improvements)
- 2-3 Medium priority tasks (valuable enhancements)
- 1 Low priority task (nice-to-have features)

### 2. Branch Creation from Tasks

```bash
# Example: Starting TASK-001
git checkout main && git pull origin main
git checkout -b enhancement/performance-optimization

# Work on the task following DEVELOPMENT_PROTOCOL.md
# Make commits using task context for commit messages
```

### 3. Commit Message Templates

Use task information to create meaningful commit messages:

```bash
# Feature commit
git commit -m "feat(performance): implement memoization for multi-scenario calculations

- Add useMemo optimization in useWasteSimulation hook
- Reduce re-calculation frequency by 60%
- Maintain state consistency across scenario switches

Related: TASK-001
🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>"

# Enhancement commit  
git commit -m "enhance(mobile): optimize touch interactions for comparison charts

- Add touch event handlers to bar charts
- Implement pinch-to-zoom for detailed analysis
- Improve responsive breakpoints for tablets

Related: TASK-004"

# Fix commit
git commit -m "fix(validation): add input validation for scenario parameters

- Validate numeric ranges for waste generation rates
- Add error messages for invalid input combinations
- Prevent negative values in cost calculations

Related: TASK-013"
```

## 📊 Priority Guidelines

### High Priority Tasks
- **Performance issues** affecting user experience
- **Security vulnerabilities** or auth problems
- **Critical bugs** breaking core functionality
- **Testing infrastructure** for code quality

### Medium Priority Tasks  
- **New features** requested by users
- **UX improvements** for better usability
- **Mobile optimization** for broader accessibility
- **Data visualization** enhancements

### Low Priority Tasks
- **Advanced features** for power users
- **Experimental functionality** to test
- **Nice-to-have** improvements
- **Future-proofing** infrastructure

## 🔄 Task Lifecycle Management

### 1. Task Selection
```bash
# Review dependencies before starting
grep "TASK-001" tasks.csv  # Check if prerequisites are met
```

### 2. Progress Tracking
Update task status by adding columns or using project management tools:
- **Status**: Not Started / In Progress / In Review / Completed
- **Assigned**: Developer working on the task
- **Start Date**: When work began
- **Completion Date**: When task was finished

### 3. Success Validation
Before marking a task complete, verify all success criteria:
- [ ] Functional requirements met
- [ ] Performance benchmarks achieved  
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code review completed

## 🎨 Commit Planning Strategies

### Strategy 1: Feature-Complete Commits
- One commit per complete feature
- Include tests and documentation
- Suitable for larger, self-contained tasks

### Strategy 2: Incremental Progress Commits
- Multiple commits per task showing progress
- Each commit is a working state
- Better for complex tasks (5+ days)

### Strategy 3: Atomic Changes Commits
- Very small, focused commits
- Easy to review and revert
- Good for bug fixes and small enhancements

## 📈 Example Sprint Planning

### Sprint 1 (2 weeks): Foundation Improvements
```
High Priority:
- TASK-001: Performance Optimization (5 days)
- TASK-013: Data Validation (2 days)

Medium Priority:  
- TASK-004: Mobile Optimization (4 days)
- TASK-009: CI/CD Pipeline (3 days)

Total: 14 days (fits 2-week sprint)
```

### Sprint 2 (2 weeks): Feature Expansion
```
High Priority:
- TASK-019: Accessibility (3 days)
- TASK-016: Integration Testing (3 days)

Medium Priority:
- TASK-002: Advanced Export (3 days)
- TASK-005: Advanced Visualizations (6 days)

Total: 15 days (slightly over-planned for buffer)
```

## 🔍 Task Dependencies Management

### Dependency Chain Example:
```
TASK-001 (Performance) → TASK-005 (Visualizations)
TASK-007 (Security) → TASK-008 (Analytics)
TASK-009 (CI/CD) → TASK-016 (Integration Tests)
```

### Planning with Dependencies:
1. **Identify critical path**: Tasks that block others
2. **Parallel work**: Tasks that can be done simultaneously  
3. **Buffer time**: Account for dependency delays
4. **Risk mitigation**: Have alternative tasks ready

## 📝 Updating the Task List

### Adding New Tasks:
```csv
TASK-021,New Feature Title,"Description of new requirement",Medium,3 days,feature,feature/new-feature,TASK-001,"Success criteria here","files/to/modify.tsx"
```

### Modifying Existing Tasks:
- Update estimates based on actual effort
- Adjust priorities based on business needs
- Add discovered dependencies
- Refine success criteria

## 🎯 Best Practices

1. **Start with high-priority tasks** to deliver value early
2. **Consider dependencies** when planning sprint order
3. **Keep commits atomic** and related to specific task aspects  
4. **Use task IDs in commit messages** for traceability
5. **Update estimates** based on actual completion times
6. **Review completed tasks** to improve future estimates

---

This task planning system ensures organized development cycles while maintaining the quality and structure established in the DEVELOPMENT_PROTOCOL.md.