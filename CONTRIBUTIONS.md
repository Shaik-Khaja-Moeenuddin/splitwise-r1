# Team contribution record (complete with your real details)

Do not claim work that a team member did not do. Fill this in before submission.

| Team member | Student ID | Actual contribution | Evidence (commit / screenshot / file) |
|---|---|---|---|
| Member 1 |  | React app structure, routing and authentication |  |
| Member 2 |  | Groups, expenses and equal-split balance logic |  |
| Member 3 |  | Admin module and Local Storage data handling |  |
| Member 4 |  | Responsive UI, testing and deployment |  |

## Suggested Git workflow (run in the project directory)

```bash
git init
git add .
git commit -m "chore: initialize SplitWise project"
git branch feature/auth
git branch feature/groups-expenses
git branch feature/admin-responsive-ui
```

For each feature, switch to its branch, make and test the corresponding changes, then commit them:

```bash
git switch feature/auth
git add .
git commit -m "feat: implement login and signup"
git switch main
git merge feature/auth
```

Repeat for the other feature branches. Use `git status`, `git log --oneline --graph --all`, and screenshots of the actual repository history as evidence. If your default branch is named `master`, use `master` instead of `main`.
