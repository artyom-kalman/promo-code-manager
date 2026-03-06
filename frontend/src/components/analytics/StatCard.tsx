import { Group } from '@mantine/core';
import type { IconProps } from '@tabler/icons-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import classes from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
}

export function StatCard({ label, value, icon: IconComponent }: StatCardProps) {
  return (
    <div className={classes.card}>
      <Group justify="space-between" align="flex-start">
        <div>
          <div className={classes.label}>{label}</div>
          <div className={classes.value}>{value}</div>
        </div>
        <div className={classes.iconWrap}>
          <IconComponent size={18} stroke={1.5} />
        </div>
      </Group>
    </div>
  );
}
