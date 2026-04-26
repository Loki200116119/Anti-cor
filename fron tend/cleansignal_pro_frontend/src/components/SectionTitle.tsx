import React from 'react';

interface SectionTitleProps {
  icon: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

function SectionTitle({ icon, eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <div className="section-title">
      <div className="eyebrow dark">
        <span>{icon}</span>
        {eyebrow}
      </div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

export default SectionTitle;