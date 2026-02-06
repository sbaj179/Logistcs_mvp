import type { Event } from "@/lib/types";
import styles from "@/styles/Timeline.module.css";

interface TimelineProps {
  events: Event[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className={styles.timeline}>
      {events.map((event) => (
        <div key={event.id} className={styles.item}>
          <div className={styles.marker} />
          <div>
            <div className={styles.meta}>
              <span>{event.type}</span>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            <p className={styles.summary}>{event.summary}</p>
            <p className={styles.source}>Source: {event.source} · Hash: {event.immutableHash}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
