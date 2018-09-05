<?php

namespace Akeneo\Pim\Enrichment\Component\Product\Value;

use Akeneo\Pim\Enrichment\Component\Product\Model\AbstractValue;

/**
 * Product value for attribute types:
 *   - pim_catalog_image
 *   - pim_catalog_file
 *
 * @author    Marie Bochu <marie.bochu@akeneo.com>
 * @copyright 2017 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
class MediaValue extends AbstractValue implements MediaValueInterface
{
    /** @var string FileInfo key */
    protected $data;

    /**
     * {@inheritdoc}
     */
    protected function __construct(string $attributeCode, string $data, ?string $scopeCode, ?string $localeCode)
    {
        parent::__construct($attributeCode, $data, $scopeCode, $localeCode);
    }

    /**
     * {@inheritdoc}
     */
    public function getData(): string
    {
        return $this->data;
    }

    /**
     * {@inheritdoc}
     */
    public function __toString(): string
    {
        return null !== $this->data ? $this->data : '';
    }
}
