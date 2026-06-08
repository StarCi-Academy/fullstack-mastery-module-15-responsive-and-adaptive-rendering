import { Card, Typography } from "@heroui/react"

/**
 * HeavyWidget — simulates an expensive UI chunk (charts, rich editor, etc.).
 * This module is dynamically imported via lazy(); the JS chunk is only fetched
 * when AdaptiveSection decides the connection is capable.
 */
const HeavyWidget = (): JSX.Element => {
    return (
        <Card data-testid="heavy-widget" className="rounded-3xl border border-default-200 p-3 shadow-none">
            <Card.Header className="p-0">
                <Typography.Paragraph size="sm" color="muted" className="font-semibold">
                    Analytics Widget
                </Typography.Paragraph>
            </Card.Header>
            <Card.Content className="flex flex-col gap-2 p-0">
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

export default HeavyWidget
