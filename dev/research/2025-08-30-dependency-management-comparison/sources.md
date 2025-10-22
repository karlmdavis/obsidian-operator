# Research Sources and References

## Primary Documentation

### Renovate
- [Official Renovate Documentation](https://docs.renovatebot.com/)
- [Renovate Configuration Options](https://docs.renovatebot.com/configuration-options/)  
- [Automated Dependency Updates for Bun](https://docs.renovatebot.com/modules/manager/bun/)
- [Bot Comparison Guide](https://docs.renovatebot.com/bot-comparison/)

### Dependabot
- [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Dependabot Configuration Reference](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [GitHub Changelog: Dependabot Bun Support](https://github.blog/changelog/2025-02-13-dependabot-version-updates-now-support-the-bun-package-manager-ga/)

## Community Analysis and Comparisons

### Technical Deep Dives
- [Why I recommend Renovate over any other dependency update tools](https://www.jvt.me/posts/2024/04/12/use-renovate/) - Jamie Tanna
- [Renovate vs. Dependabot: Which Bot Will Rule Your Monorepo?](https://dev.to/alex_aslam/renovate-vs-dependabot-which-bot-will-rule-your-monorepo-4431) - DEV Community
- [Dependency Management with Renovate: Beyond the Limits of Dependabot](https://opstree.com/blog/2024/03/12/dependency-management-with-renovate-beyond-the-limits-of-dependabot/)
- [Renovate vs Dependabot: Dependency and Vulnerability Management](https://codepad.co/blog/renovate-vs-dependabot-dependency-and-vulnerability-management/) - Codepad Blog

### Enterprise Usage Studies
- [How to renovate? Automated dependency updates](https://senacor.blog/how-to-renovate-why-and-how-you-should-use-automated-dependency-updates-in-your-software-projects/) - Senacor Blog
- [Managing Project Dependencies](https://wayfair.github.io/docs/managing-dependencies/) - Wayfair Open Source
- [Open-Source Software Vulnerability Mitigation](https://senacor.blog/open-source-software-vulnerability-mitigation-through-automated-dependency-management/)

## TypeScript Project Examples

### Popular Open Source Projects Using Renovate
- [Angular Framework](https://github.com/angular/angular/blob/main/renovate.json)
- [Apollo GraphQL TypeScript Template](https://github.com/apollographql/typescript-repo-template/blob/main/renovate.json5)
- [TypeScript Next.js Starter](https://github.com/jpedroschmitz/typescript-nextjs-starter/blob/main/renovate.json)
- [Total TypeScript React Tutorial](https://github.com/total-typescript/react-typescript-tutorial/blob/main/renovate.json)
- [Sourcegraph JavaScript TypeScript Language Server](https://github.com/sourcegraph/javascript-typescript-langserver/blob/master/renovate.json)

### Dependabot Configuration Examples
- [Node.js Official Website](https://github.com/nodejs/nodejs.org/blob/main/.github/dependabot.yml)
- [TypeScript ESLint Project Configuration Issues](https://github.com/typescript-eslint/typescript-eslint/issues/11454)

## Package Manager Support Research

### Bun Specific
- [Renovate Bun Package Manager Discussion](https://github.com/renovatebot/renovate/discussions/24511)
- [Dependabot Bun Support Issue](https://github.com/dependabot/dependabot-core/issues/6528)
- [Bun Manager npmrc Issues](https://github.com/renovatebot/renovate/issues/30926)
- [Package Manager Field Updates Discussion](https://github.com/renovatebot/renovate/discussions/25704)

## Security and Vulnerability Management

### Security Update Strategies
- [Security updates never seem to get PRs created, why?](https://github.com/renovatebot/renovate/discussions/14289) - Renovate Discussion
- [Unlocking security updates for transitive dependencies with npm](https://github.blog/security/supply-chain-security/unlocking-security-updates-for-transitive-dependencies-with-npm/) - GitHub Blog
- [Securing dependencies: A comprehensive study of Dependabot's impact](https://link.springer.com/article/10.1007/s10664-025-10638-w) - Empirical Software Engineering

## Configuration Best Practices

### Renovate Configuration Guides  
- [Common Practices for Renovate Configuration](https://docs.mend.io/wsk/common-practices-for-renovate-configuration/)
- [A good starting config for Renovate with Node.js](https://www.darraghoriordan.com/2023/08/06/renovate-nodeje-project-starter/)
- [Basic Renovate Configuration for Angular Project](https://stackoverflow.com/questions/78173514/basic-renovate-configuration-for-angular-project)

### Community Configurations
- [Teppei's Renovate Config](https://github.com/teppeis/renovate-config) - Shareable configuration example
- [Mike Works TypeScript Fundamentals](https://github.com/mike-works/typescript-fundamentals/blob/master/renovate.json)

## GitHub Integration and Tooling

### GitHub Apps and Actions
- [Renovate GitHub App](https://github.com/apps/renovate)
- [Dependency management made easy with Dependabot and GitHub Actions](https://duncanlew.medium.com/dependency-management-made-easy-with-denpendabot-and-github-actions-2f0039a63600)
- [How to Automate Dependency Updates with GitHub Dependabot](https://www.velir.com/ideas/2022/11/28/how-to-automate-dependency-updates-with-github-dependabot)

## Industry Surveys and Adoption Data

### 2024 Usage Statistics
- Survey data from Senacor showing 9/10 teams using Renovate vs 2/10 using Dependabot
- Community adoption trends in TypeScript ecosystem
- Open source project dependency management patterns

## Obsidian Plugin Development Context

### Obsidian Ecosystem
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) - TypeScript template
- [Obsidian Plugin Development Documentation](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Obsidian Community Plugins Repository](https://github.com/obsidianmd/obsidian-releases)
- [Obsidian Plugin Topics on GitHub](https://github.com/topics/obsidian-plugin) - 1,459 TypeScript-based plugins

## Tools for Security and Code Quality
- [6 Tools To Help Keep Your Dependencies And Code More Secure](https://dev.to/schalkneethling/6-tools-to-help-keep-your-dependencies-and-code-more-secure-13mi)
- Various dependency scanning and security audit tools complementing automated updates