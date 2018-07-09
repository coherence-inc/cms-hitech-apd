import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

const addIf = (condit, yes, no = '') => (condit ? yes : no);

const SidebarLink = ({ anchor, children, depth, hash, sub, ...rest }) => (
  <Fragment>
    <li
      className={`mb1 relative sb-item ${addIf(depth, 'pl2')} ${addIf(
        hash === anchor,
        'sb-item-active'
      )}`}
    >
      <a
        href={`#${anchor || '!'}`}
        className="block white text-decoration-none truncate"
        {...rest}
      >
        {children}
      </a>
    </li>
    {sub.map(l => (
      <SidebarLink key={l.id} anchor={l.id} hash={hash} depth={depth + 1}>
        {l.name}
      </SidebarLink>
    ))}
  </Fragment>
);

SidebarLink.propTypes = {
  anchor: PropTypes.string,
  children: PropTypes.node.isRequired,
  depth: PropTypes.number,
  hash: PropTypes.string,
  sub: PropTypes.array
};

SidebarLink.defaultProps = {
  anchor: null,
  depth: 0,
  hash: null,
  sub: []
};

export default SidebarLink;
