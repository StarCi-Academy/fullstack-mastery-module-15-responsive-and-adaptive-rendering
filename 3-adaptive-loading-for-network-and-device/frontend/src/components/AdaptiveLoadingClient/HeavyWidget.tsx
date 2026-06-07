import { Card, Typography } from "@heroui/react"

/**
 * HeavyWidget — simulates an expensive UI chunk (charts, rich editor, etc.).
 * This module is dynamically imported via lazy(); the JS chunk is only fetched
 * when AdaptiveSection decides the connection is capable.
 */
export default function HeavyWidget(): JSX.Element {
    return (
        <Card data-testid="heavy-widget" className="p-4">
            <Card.Header className="flex items-center gap-2 p-0">
                {/* Inline SVG icon — no icon package dependency */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="text-accent"
                >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <Typography.Heading level={6} weight="semibold">
                    Analytics Widget
                </Typography.Heading>
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
