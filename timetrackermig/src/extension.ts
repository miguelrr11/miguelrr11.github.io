import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

class TimeTracker {
    private primarySeconds = 0;
    private inactivitySeconds = 0;
    private isActive = false;
    private interval: NodeJS.Timeout | undefined;
    private statusBar: vscode.StatusBarItem;
    private storagePath: string;
    private idleThreshold = 20; // seconds
    

    constructor(private context: vscode.ExtensionContext) {
        this.statusBar = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            0
        );

        this.statusBar.text = "$(circle-filled)";
        this.statusBar.tooltip = "Code Time Tracker";
        this.statusBar.color = "green";
        this.statusBar.show();
        this.statusBar.command = "codeTimeTracker.showStats";


        this.storagePath = path.join(
            context.globalStorageUri.fsPath,
            "time-data.json"
        );

        vscode.commands.registerCommand(
            "codeTimeTracker.showStats",
            () => tracker.showStats()
        );


        if (!fs.existsSync(context.globalStorageUri.fsPath)) {
            fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
        }

        this.startLoop();
        this.registerActivityListeners();
    }

    private startLoop() {
        this.interval = setInterval(() => {
            this.inactivitySeconds++;

            if (this.inactivitySeconds < this.idleThreshold) {
                this.primarySeconds++;
                this.setActive(true);
            } else {
                this.setActive(false);
            }
        }, 1000);
    }

    private registerActivityListeners() {
        const reset = () => {
            this.inactivitySeconds = 0;
        };

        vscode.workspace.onDidChangeTextDocument(reset);
        vscode.window.onDidChangeTextEditorSelection(reset);
        vscode.window.onDidChangeActiveTextEditor(reset);
        vscode.window.onDidChangeTextEditorVisibleRanges(reset);
        vscode.window.onDidChangeWindowState(state => {
            if (!state.focused) {
                this.inactivitySeconds = this.idleThreshold;
            }
        });
    }

    private setActive(active: boolean) {
            this.isActive = active;
            this.statusBar.color = active ? "green" : "grey";
        }

    public async showStats() {
        await this.saveToday();

        const data = this.readData();

        const today = this.getTodayKey();
        const todaySeconds = data[today] || 0;

        const todayFormatted = this.formatTime(todaySeconds);

        const action = await vscode.window.showInformationMessage(
            `Today: ${todayFormatted}`,
            "Show More"
        );

        if (action === "Show More") {
            this.showDetailedStats(data);
        }
    }

    private showDetailedStats(data: Record<string, number>) {
        const now = new Date();

        let weekSeconds = 0;
        let monthSeconds = 0;
        let allTimeSeconds = 0;

        const currentWeek = this.getWeekNumber(now);
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        for (const dateStr in data) {
            const seconds = data[dateStr];
            const date = new Date(dateStr);

            allTimeSeconds += seconds;

            if (
                date.getFullYear() === currentYear &&
                this.getWeekNumber(date) === currentWeek
            ) {
                weekSeconds += seconds;
            }

            if (
                date.getFullYear() === currentYear &&
                date.getMonth() === currentMonth
            ) {
                monthSeconds += seconds;
            }
        }

        vscode.window.showInformationMessage(
            `Week: ${this.formatTime(weekSeconds)} | ` +
            `Month: ${this.formatTime(monthSeconds)} | ` +
            `All Time: ${this.formatTime(allTimeSeconds)}`
        );
    }

    private getWeekNumber(date: Date): number {
        const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = temp.getUTCDay() || 7;
        temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
        return Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }




    private async saveToday() {
        const data = this.readData();
        const today = this.getTodayKey();

        if (!data[today]) {
            data[today] = 0;
        }

        data[today] += this.primarySeconds;
        this.primarySeconds = 0;

        fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    }

    private readData(): Record<string, number> {
        if (!fs.existsSync(this.storagePath)) {
            return {};
        }
        const raw = fs.readFileSync(this.storagePath, 'utf-8');
        return JSON.parse(raw);
    }

    private getTodayKey(): string {
        const now = new Date();
        return now.toISOString().split("T")[0];
    }

    private formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    }

    public dispose() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.saveToday();
    }
}

let tracker: TimeTracker;

export function activate(context: vscode.ExtensionContext) {
    console.log("Code Time Tracker Activated");


    tracker = new TimeTracker(context);

    const disposable = vscode.commands.registerCommand(
        "codeTimeTracker.showStats",
        () => tracker.showStats()
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (tracker) {
        tracker.dispose();
    }
}
