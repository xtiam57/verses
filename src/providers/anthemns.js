import React, { useState, useMemo } from 'react';
import json from 'assets/data/anthemns';
import { Slide } from 'utils';

const AnthemnsContext = React.createContext({});

function splitLines(title, text, array, index) {
  const lines = text.split('/n');

  if (lines.length > 5) {
    const divider = lines.length > 10 ? 3 : 2;
    const size = Math.ceil(lines.length / divider);

    [...Array(divider).keys()].forEach((i) => {
      array.push(
        Slide.create({
          title: i === 0 ? title : null,
          text: lines.slice(i * size, (1 + i) * size).join('/n'),
          index: index++,
        })
      );
    });
  } else {
    array.push(
      Slide.create({
        title,
        text: text,
        index: index++,
      })
    );
  }
  return index;
}

function AnthemnsProvider({ children }) {
  const tagsSet = new Set();

  const anthemns = useMemo(() => {
    return json.map(
      (
        { number, title, startsWithChorus, chorus, stanzas, tags, authors },
        index
      ) => {
        const slides = [];
        let text = '';
        let slideIndex = 0;
        const isNotAnthemn = tags?.toLowerCase().includes('coro');
        const isExtra = tags?.toLowerCase().includes('apéndice');

        if (tags) {
          tagsSet.add(tags?.toLowerCase());
        }

        slides.push(
          Slide.create({
            title: `${
              isNotAnthemn
                ? 'Coro'
                : `${isExtra ? 'Apéndice' : `Himno #${number}`}`
            }`,
            text: title,
            subtext: authors,
            index: slideIndex++,
          })
        );

        if (startsWithChorus) {
          slideIndex = splitLines('Coro', chorus, slides, slideIndex);
        }

        stanzas.forEach((stanza, i) => {
          slideIndex = splitLines(null, stanza, slides, slideIndex);
          text += `${stanza} /n/n`;

          if (chorus) {
            slideIndex = splitLines('Coro', chorus, slides, slideIndex);

            if (i === 0) {
              text += `(CORO) /n${chorus} /n/n`;
            }
          }
        });

        slides.push(Slide.create({ text: '&#119070;', index: slideIndex }));

        return {
          id: `Himno_${number}`,
          index,
          number,
          title: `${isNotAnthemn || isExtra ? '' : `#${number} `}${title}`,
          type: 'anthemn',
          slides,
          text,
          tags,
          authors,
          length: slides.length,
          firstSlide: slides[0],
          lastSlide: slides[slides.length - 1],
        };
      }
    );
  }, [tagsSet]);

  const [first] = anthemns;
  const [current, setCurrent] = useState(first);
  const [tags] = useState(Array.from(tagsSet).sort());

  return (
    <AnthemnsContext.Provider
      value={{
        anthemns,
        current,
        setCurrent,
        tags,
      }}
    >
      {children}
    </AnthemnsContext.Provider>
  );
}

export { AnthemnsProvider, AnthemnsContext };
