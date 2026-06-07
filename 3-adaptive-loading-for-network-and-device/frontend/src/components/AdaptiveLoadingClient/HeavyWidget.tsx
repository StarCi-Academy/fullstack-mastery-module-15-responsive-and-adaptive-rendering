import { Card, Typography } from "@heroui/react"

/**
 * HeavyWidget — simulates an expensive UI chunk (charts, rich editor, etc.).
 * This module is dynamically imported via lazy(); the JS chunk is only fetched
 * when AdaptiveSection decides the connection is capable.
 */
export default function HeavyWidget(): JSX.Element {
    return (
        <Card data-testid="heavy-widget" className="rounded-3xl border border-border p-3 shadow-none">
            <Card.Header className="p-0">
                <p className="text-sm font-semibold">Analytics Widget</p>
            </Card.Header>
            <Card.Content className="flex flex-col gap-2 p-0">
                <div className="h-1" />
                {/* Simulated chart bars */}
                <div className="flex items-end gap-1 h-16">
                    {[40, 65, 55, 80, 70, 90, 60].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 rounded-sm bg-accent opacity-70"
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
                <Typography.Paragraph size="xs" color="muted">
                    Heavy analytics widget — loaded because your connection is capable.
                </Typography.Paragraph>
            </Card.Content>
        </Card>
    )
}
